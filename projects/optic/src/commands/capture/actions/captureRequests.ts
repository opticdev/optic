import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fetch, { FetchError } from 'node-fetch';
import Bottleneck from 'bottleneck';
import exitHook from 'exit-hook';
import { exec } from 'child_process';
import ora from 'ora';
import urljoin from 'url-join';
import { UserError } from '@useoptic/openapi-utilities';

import { logger } from '../../../logger';
import { commandSplitter } from '../../../utils/capture';
import {
  CaptureConfigData,
  OpticCliConfig,
  RequestSend,
} from '../../../config';
import { HarEntries } from '../sources/har';
import { getSpinner } from '../../../utils/spinner';
import { ProxyInteractions, ProxyServer } from '../sources/proxy';

const defaultServerReadyTimeout = 10_000; // 10s

// Clears logging so that the spinner is always flushed to the bottom until it is completed
const loggerWhileSpinning = {
  debug: (spinner?: ora.Ora, ...msg: any[]) => {
    spinner?.clear();
    logger.debug(...msg);
    spinner?.render();
  },
  error: (spinner?: ora.Ora, ...msg: any[]) => {
    spinner?.clear();
    logger.error(...msg);
    spinner?.render();
  },
  info: (spinner?: ora.Ora, ...msg: any[]) => {
    spinner?.clear();
    logger.info(...msg);
    spinner?.render();
  },
};

const wait = (time: number) =>
  new Promise((r) => setTimeout(() => r(null), time));

type Bailout = { didBailout: boolean; promise: Promise<any> };
function startApp(
  command: string,
  dir: string,
  spinner?: ora.Ora
): [ChildProcessWithoutNullStreams, Bailout] {
  const cmd = commandSplitter(command);
  let app: ChildProcessWithoutNullStreams;
  try {
    app = spawn(cmd.cmd, cmd.args, { detached: true, cwd: dir, shell: true });
  } catch (e) {
    throw new UserError({ message: (e as Error).message });
  }

  app.stdout.on('data', (data) => {
    loggerWhileSpinning.debug(spinner, data.toString());
  });

  app.stderr.on('data', (data) => {
    loggerWhileSpinning.error(spinner, data.toString());
  });

  const bailout: Bailout = {
    didBailout: false,
    promise: new Promise((resolve) => {
      app!.on('exit', (code) => {
        bailout.didBailout = true;
        // Resolve instead of reject since in cases where spawn cmd instantly fails we end up with an unhandled rejection
        resolve(
          new UserError({
            message: `Server unexpectedly exited with error code ${code}`,
          })
        );
      });
    }),
  };
  return [app, bailout];
}

async function waitForServer(
  bailout: Bailout,
  readyEndpoint: string,
  readyInterval: number,
  readyTimeout: number,
  targetUrl: string,
  spinner?: ora.Ora
) {
  //
  // wait for the app to be ready
  //

  const url = urljoin(targetUrl, readyEndpoint);
  const timeout = readyTimeout || defaultServerReadyTimeout;
  const now = Date.now();
  let didTimeout = false;

  const checkServer = (): Promise<boolean> =>
    fetch(url)
      .then((res) => String(res.status).startsWith('2'))
      .catch((e) => {
        loggerWhileSpinning.debug(spinner, e);
        return false;
      });

  const serverReadyPromise = new Promise(async (resolve, reject) => {
    let done = false;

    // We need to bail out if the server shut down, otherwise we never conclude this promise chain
    while (!done && !bailout.didBailout) {
      const isReady = await checkServer();

      if (isReady) {
        done = true;
      } else if (Date.now() > now + timeout) {
        didTimeout = true;
        reject(
          new UserError({
            message: 'The server timed out before a successful healthcheck.',
          })
        );
      }
      await wait(readyInterval);
    }

    if (didTimeout)
      spinner?.fail(
        'Verify the server URL in your optic.yml is correct and your server is reachable.'
      );

    if (!bailout.didBailout) resolve(null);
  });

  await Promise.race([
    serverReadyPromise,
    bailout.promise.then((e) => {
      throw e;
    }),
  ]);
}

function sendRequests(
  reqs: RequestSend[],
  proxyUrl: string,
  concurrency: number,
  spinner?: ora.Ora
): Promise<any>[] {
  const limiter = new Bottleneck({
    maxConcurrent: concurrency,
    minTime: 0,
  });
  return reqs.map(async (r) => {
    let verb = r.method || 'GET';
    let opts = {
      method: verb,
      headers: {},
    };

    if (r.data) opts['body'] = JSON.stringify(r.data);

    if (r.headers) {
      // convert all header keys to lowercase for easier content-type checking below
      const headers = Object.keys(r.headers).reduce(
        (acc, key) => {
          acc[key.toLowerCase()] = r.headers![key];
          return acc;
        },
        {} as { [key: string]: string }
      );

      opts['headers'] = headers;
    }

    // if a content-type header is not set, add it
    if (!opts['headers'].hasOwnProperty('content-type')) {
      opts['headers']['content-type'] = 'application/json;charset=UTF-8';
    }

    return limiter.schedule(() =>
      fetch(urljoin(proxyUrl, r.path), opts).catch((error: FetchError) => {
        loggerWhileSpinning.error(spinner, error.message);
      })
    );
  });
}

async function runRequestsCommand(
  command: string,
  proxyVar: string,
  proxyUrl: string,
  spinner?: ora.Ora
): Promise<void> {
  const cmd = commandSplitter(command);
  let reqCmd: ChildProcessWithoutNullStreams;

  try {
    reqCmd = spawn(cmd.cmd, cmd.args, {
      env: {
        ...process.env,
        [proxyVar]: proxyUrl,
      },
      detached: true,
      shell: true,
    });
  } catch (e) {
    throw new UserError({ initialError: e as Error });
  }

  let reqCmdPromise: Promise<void>;
  reqCmdPromise = new Promise((resolve, reject) => {
    reqCmd.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new UserError({
            message: `command ${cmd} failed with exit code ${code}`,
          })
        );
      }
    });
  });

  reqCmd.stdout.on('data', (data) => {
    loggerWhileSpinning.info(spinner, data.toString());
  });

  reqCmd.stderr.on('data', (data) => {
    loggerWhileSpinning.error(spinner, data.toString());
  });

  return reqCmdPromise;
}

function makeAllRequests(
  captureConfig: CaptureConfigData,
  proxyUrl: string,
  spinner?: ora.Ora
) {
  // send requests
  let sendRequestsPromise: Promise<any> = Promise.resolve();
  if (captureConfig.requests && captureConfig.requests.send) {
    const requests = sendRequests(
      captureConfig.requests.send,
      proxyUrl,
      captureConfig.config?.request_concurrency || 5,
      spinner
    );
    sendRequestsPromise = Promise.allSettled(requests).then((results) => {
      let hasError = false;
      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          const req = captureConfig.requests![idx];
          loggerWhileSpinning.error(
            spinner,
            `Request ${req.method ?? 'GET'} ${req.path} failed with ${
              result.reason
            }`
          );
          hasError = true;
        }
      });
      if (hasError) throw new Error('Some requests failed');
    });
  }

  // run requests command
  let runRequestsPromise: Promise<void> = Promise.resolve();
  if (captureConfig.requests && captureConfig.requests.run) {
    const proxyVar = captureConfig.requests.run.proxy_variable || 'OPTIC_PROXY';

    runRequestsPromise = runRequestsCommand(
      captureConfig.requests.run.command,
      proxyVar,
      proxyUrl,
      spinner
    );
  }

  return [sendRequestsPromise, runRequestsPromise];
}

export async function captureRequestsFromProxy(
  config: OpticCliConfig,
  captureConfig: CaptureConfigData,
  options: { proxyPort?: string; serverOverride?: string; serverUrl: string }
) {
  let app: ChildProcessWithoutNullStreams | undefined = undefined;
  let proxy: ProxyServer | undefined = undefined;
  function cleanup() {
    proxy?.stop();
    if (app && app.pid && app.exitCode === null) {
      if (process.platform === 'win32') {
        // https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/taskkill
        exec(`taskkill /pid ${app.pid} /t /f`);
      } else {
        process.kill(-app.pid);
      }
    }
  }
  const unsubscribeHook = exitHook(() => {
    cleanup();
  });
  const spinner = getSpinner({
    text: 'Generating traffic to send to server',
    color: 'blue',
  })?.start();
  let interactions: ProxyInteractions | null = null;

  const serverUrl = options.serverUrl;
  const serverDir =
    captureConfig.server.dir === undefined
      ? config.root
      : captureConfig.server.dir;
  const timeout =
    captureConfig.server.ready_timeout || defaultServerReadyTimeout;
  const readyInterval = captureConfig.server.ready_interval || 1000;
  // start app

  let errors: any[] = [];
  try {
    let bailout: Bailout = {
      didBailout: false,
      // If no server is started, we never need to bailout so we need a noop promise that never resolves
      promise: new Promise(() => {}),
    };
    if (!options.serverOverride && captureConfig.server.command) {
      loggerWhileSpinning.debug(
        spinner,
        `Starting app using command ${captureConfig.server.command}`
      );
      [app, bailout] = startApp(
        captureConfig.server.command,
        serverDir,
        spinner
      );

      // since ready_endpoint is not required always wait one interval. without ready_endpoint,
      // ready_interval must be at least the time it takes to start the server.
      await wait(readyInterval);

      if (captureConfig.server.ready_endpoint) {
        if (spinner) spinner.text = 'Waiting for server to come online...';
        await waitForServer(
          bailout,
          captureConfig.server.ready_endpoint,
          readyInterval,
          timeout,
          serverUrl,
          spinner
        );
      }
    }
    // start proxy
    proxy = new ProxyServer(serverUrl);
    const [proxyInteractions, proxyUrl] = await proxy.start(
      options.proxyPort ? Number(options.proxyPort) : undefined
    );
    interactions = proxyInteractions;

    if (spinner) spinner.text = 'Sending requests to server';
    let [sendRequestsPromise, runRequestsPromise] = makeAllRequests(
      captureConfig,
      proxyUrl,
      spinner
    );
    // Here we continue even if some of the requests failed - we log out the requests errors but use the rest to query
    const requestsPromises = Promise.all([
      sendRequestsPromise,
      runRequestsPromise,
    ]);
    // Wait for either all the requests to complete (or reject), or for the app to shutdown prematurely
    await Promise.race([
      bailout.promise.then((e) => {
        throw e;
      }),
      requestsPromises,
    ]);
    // catch the bailout promise rejection when we shutdown the app
    bailout.promise.catch((e) => {});
  } catch (e) {
    spinner?.fail((e as Error).message);

    // Meaning either the requests threw an uncaught exception or the app server randomly quit
    process.exitCode = 1;
    // The finally block will run before we return from the fn call
    return;
  } finally {
    unsubscribeHook();
    cleanup();

    if (errors.length > 0) {
      logger.error('finished with errors:');
      errors.forEach((error, index) => {
        logger.error(`${index}:\n${error}`);
      });
    }
  }

  spinner?.succeed('Finished running requests');

  // process proxy interactions into hars
  return HarEntries.fromProxyInteractions(interactions);
}
