import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import fetch from 'node-fetch';
import Bottleneck from 'bottleneck';

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
import { ProxyInteractions } from '../sources/proxy';
import { HarEntries } from '../sources/har';

const defaultServerReadyTimeout = 10_000; // 10s

const wait = (time: number) =>
  new Promise((r) => setTimeout(() => r(null), time));

class ProxyInstance {
  interactions!: ProxyInteractions;
  url!: string;
  targetUrl: string;
  private abortController: AbortController;

  constructor(target: string) {
    this.abortController = new AbortController();
    this.targetUrl = target;
  }

  public async start(port: number | undefined) {
    [this.interactions, this.url] = await ProxyInteractions.create(
      this.targetUrl,
      this.abortController.signal,
      {
        mode: 'reverse-proxy',
        proxyPort: port,
      }
    );
  }

  stop() {
    this.abortController.abort();
  }
}

type Bailout = { didBailout: boolean; promise: Promise<any> };
function startApp(
  command: string,
  dir: string
): [ChildProcessWithoutNullStreams, Bailout] {
  const cmd = commandSplitter(command);
  const app = spawn(cmd.cmd, cmd.args, { detached: true, cwd: dir });

  app.stdout.on('data', (data) => {
    logger.debug(data.toString());
  });

  app.stderr.on('data', (data) => {
    logger.error(data.toString());
  });

  const bailout: Bailout = {
    didBailout: false,
    promise: new Promise((resolve, reject) => {
      app!.on('exit', (code) => {
        bailout.didBailout = true;
        reject(`Server unexpectedly exited with error code ${code}`);
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
  spinner: ora.Ora
) {
  // since ready_endpoint is not required always wait one interval. without ready_endpoint,
  // ready_interval must be at least the time it takes to start the server.
  await wait(readyInterval);

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
        logger.debug(e);
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
        reject(new UserError({ message: 'Server check timed out.' }));
      }
      await wait(readyInterval);
    }
    if (bailout.didBailout && !didTimeout)
      spinner.fail('Server unexpectedly exited');
    if (didTimeout) spinner.fail('Server check timed out');
    resolve(null);
  });

  await Promise.race([serverReadyPromise, bailout.promise]);
}

function sendRequests(
  reqs: RequestSend[],
  proxyUrl: string,
  concurrency: number
): Promise<void>[] {
  const limiter = new Bottleneck({
    maxConcurrent: concurrency,
    minTime: 0,
  });
  return reqs.map(async (r) => {
    let verb = r.method || 'GET';
    let opts = { method: verb };

    r.data ? (opts['body'] = JSON.stringify(r.data)) : '{}';

    if (r.headers) opts['headers'] = r.headers;

    return limiter.schedule(() =>
      fetch(`${proxyUrl}${r.path}`, opts)
        .then((response) => response.json())
        .catch((error) => {
          logger.error(error);
        })
    );
  });
}

async function runRequestsCommand(
  command: string,
  proxyVar: string,
  proxyUrl: string
): Promise<void> {
  const cmd = commandSplitter(command);
  const reqCmd = spawn(cmd.cmd, cmd.args, {
    env: {
      ...process.env,
      [proxyVar]: proxyUrl,
    },
    detached: true,
    shell: true,
  });

  let reqCmdPromise: Promise<void>;
  reqCmdPromise = new Promise((resolve, reject) => {
    reqCmd.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
  reqCmd.stderr.on('data', (data) => {
    logger.error(data.toString());
  });
  return reqCmdPromise;
}

function makeAllRequests(
  captureConfig: CaptureConfigData,
  proxy: ProxyInstance
) {
  // send requests
  let sendRequestsPromise: Promise<any> = Promise.resolve();
  if (captureConfig.requests && captureConfig.requests.send) {
    const requests = sendRequests(
      captureConfig.requests.send,
      proxy.url,
      captureConfig.config?.request_concurrency || 5
    );
    sendRequestsPromise = Promise.allSettled(requests).then((results) => {
      let hasError = false;
      results.forEach((result, idx) => {
        if (result.status === 'rejected') {
          const req = captureConfig.requests![idx];
          logger.error(
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
      proxy.url
    );
  }

  return [sendRequestsPromise, runRequestsPromise];
}

export async function captureRequestsFromProxy(
  config: OpticCliConfig,
  captureConfig: CaptureConfigData,
  options: { proxyPort?: string; serverOverride?: string }
) {
  const spinner = ora({
    text: 'Generating traffic to send to server',
    color: 'blue',
  }).start();

  const serverUrl = options.serverOverride || captureConfig.server.url;
  const serverDir =
    captureConfig.server.dir === undefined
      ? config.root
      : captureConfig.server.dir;
  const timeout =
    captureConfig.server.ready_timeout || defaultServerReadyTimeout;
  const readyInterval = captureConfig.server.ready_interval || 1000;
  // start app
  let app: ChildProcessWithoutNullStreams | undefined;
  let proxy: ProxyInstance | undefined = undefined;

  let errors: any[] = [];
  try {
    let bailout: Bailout = {
      didBailout: false,
      // If no server is started, we never need to bailout so we need a noop promise that never resolves
      promise: new Promise(() => {}),
    };
    if (!options.serverOverride && captureConfig.server.command) {
      logger.debug(
        `Starting app using command ${captureConfig.server.command}`
      );
      [app, bailout] = startApp(captureConfig.server.command, serverDir);
      // If we don't bail out (i.e. the server is still running), we need the promise to be passed down to the next request
      if (captureConfig.server.ready_endpoint) {
        spinner.text = 'Waiting for server to come online...';
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
    proxy = new ProxyInstance(serverUrl);
    await proxy.start(
      options.proxyPort ? Number(options.proxyPort) : undefined
    );

    spinner.text = 'Sending requests to server';
    let [sendRequestsPromise, runRequestsPromise] = makeAllRequests(
      captureConfig,
      proxy
    );
    // Here we continue even if some of the requests failed - we log out the requests errors but use the rest to query
    const requestsPromises = Promise.allSettled([
      sendRequestsPromise,
      runRequestsPromise,
    ]);
    // Wait for either all the requests to complete (or reject), or for the app to shutdown prematurely
    await Promise.race([bailout.promise, requestsPromises]);
    // catch the bailout promise rejection when we shutdown the app
    bailout.promise.catch((e) => {});
  } catch (e) {
    // Meaning either the requests threw an uncaught exception or the app server randomly quit
    process.exitCode = 1;
    // The finally block will run before we return from the fn call
    return;
  } finally {
    proxy?.stop();
    if (app && app.pid && app.exitCode === null) {
      process.kill(-app.pid);
    }

    if (errors.length > 0) {
      logger.error('finished with errors:');
      errors.forEach((error, index) => {
        logger.error(`${index}:\n${error}`);
      });
    }
  }

  spinner.succeed('Successfully captured requests');

  // process proxy interactions into hars
  return HarEntries.fromProxyInteractions(proxy.interactions);
}
