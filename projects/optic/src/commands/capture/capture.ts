import { Command, Option } from 'commander';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { chdir } from 'process';
import path from 'path';
import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import Bottleneck from 'bottleneck';

import { isJson, isYaml, writeYaml } from '@useoptic/openapi-io';
import ora from 'ora';
import urljoin from 'url-join';
import { OpenAPIV3, UserError } from '@useoptic/openapi-utilities';
import { Request } from '../../config';
import { HarEntries, ProxyInteractions } from '../oas/captures';
import { errorHandler } from '../../error-handler';

import { createNewSpecFile } from '../../utils/specs';
import { logger } from '../../logger';
import { OpticCliConfig } from '../../config';
import { clearCommand } from '../oas/capture-clear';
import { captureV1 } from '../oas/capture';
import { getCaptureStorage, GroupedCaptures } from './storage';
import { loadSpec } from '../../utils/spec-loaders';
import { commandSplitter } from '../../utils/capture';

const wait = (time: number) =>
  new Promise((r) => setTimeout(() => r(null), time));

export function registerCaptureCommand(cli: Command, config: OpticCliConfig) {
  const command = new Command('capture');

  command.addCommand(clearCommand());

  command
    .argument('<openapi-file>', 'an OpenAPI spec file to add an operation to')
    .argument(
      '[target-url]',
      'the url to capture (deprecated, use optic.yml configuration instead)'
    )
    .description('capture traffic using the configuration in optic.yml')
    .option(
      '--proxy-port <proxy-port>',
      'specify the port the proxy should be running on'
    )

    // TODO deprecate hidden options below
    .addOption(
      new Option(
        '--no-tls',
        'disable TLS support for --proxy and prevent generation of new CA certificates'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '-r, --reverse-proxy',
        'run optic capture in reverse proxy mode - send traffic to a port that gets forwarded to your server'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '--command <command>',
        'command to run with the http_proxy and http_proxy configured'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '-d, --debug',
        `output debug information (on stderr). Use LOG_LEVEL env with 'debug', 'info' to increase verbosity`
      ).hideHelp()
    )
    .addOption(
      new Option('-o, --output <output>', 'file name for output').hideHelp()
    )
    .addOption(
      new Option(
        '-s, --server-override <url>',
        'Skip executing `capture[].server.command` and forward proxy traffic to this URL instead'
      )
    )
    .action(
      errorHandler(getCaptureAction(config, command), { command: 'capture' })
    );

  cli.addCommand(command);
}
type CaptureActionOptions = {
  proxyPort?: string;
  serverOverride?: string;
};

const getCaptureAction =
  (config: OpticCliConfig, command: Command) =>
  async (
    filePath: string,
    targetUrl: string | undefined,
    options: CaptureActionOptions
  ) => {
    // TODO capturev2 - handle relative path from root (tbd - what do we do when we handle this outside of a git repo)
    const captureConfig = config.capture?.[filePath];

    if (targetUrl !== undefined) {
      await captureV1(filePath, targetUrl, config, command);
      return;
    } else if (targetUrl !== undefined || captureConfig === undefined) {
      // TODO log error and run capture init or something - tbd what the first use is
      process.exitCode = 1;
      return;
    } else if (!captureConfig.requests && !captureConfig.requests_command) {
      logger.error(
        `"requests" or "requests_command" must be specified in optic.yml`
      );
      process.exitCode = 1;
      return;
    } else if (options.proxyPort && isNaN(Number(options.proxyPort))) {
      logger.error(
        `--proxy-port must be a number - received ${options.proxyPort}`
      );
      process.exitCode = 1;
      return;
    }
    const resolvedPath = path.resolve(filePath);
    let openApiExists = false;
    try {
      await fs.stat(resolvedPath);
      openApiExists = true;
    } catch (e) {}

    if (!openApiExists) {
      const fileCreated = await createOpenAPIFile(filePath);
      if (!fileCreated) {
        process.exitCode = 1;
        logger.error('Could not find OpenAPI file');
        return;
      }
    }
    const trafficDirectory = await getCaptureStorage(resolvedPath);
    logger.debug(`Writing captured traffic to ${trafficDirectory}`);

    if (captureConfig.server.dir === undefined) {
      chdir(config.root);
    } else {
      chdir(captureConfig.server.dir);
    }
    const serverUrl = options.serverOverride || captureConfig.server.url;
    let sourcesController = new AbortController();
    let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
      serverUrl,
      sourcesController.signal,
      {
        mode: 'reverse-proxy',
        proxyPort: options.proxyPort ? Number(options.proxyPort) : undefined,
      }
    );
    const spec = await loadSpec(filePath, config, {
      strict: false,
      denormalize: false,
    });

    // start the app
    let app: ChildProcessWithoutNullStreams | undefined = undefined;
    if (!options.serverOverride && captureConfig.server.command) {
      const cmd = commandSplitter(captureConfig.server.command);
      app = spawn(cmd.cmd, cmd.args, { detached: true });

      app.stderr.on('data', (data) => {
        logger.error(data.toString());
      });
    }

    // wait until the server is ready
    const readyInterval = captureConfig.server.ready_interval || 1000;

    // since ready_endpoint is not required always wait one interval. without ready_endpoint,
    // ready_interval must be at least the time it takes to start the server.
    await wait(readyInterval);

    if (captureConfig.server.ready_endpoint) {
      const readyUrl = urljoin(serverUrl, captureConfig.server.ready_endpoint);
      const readyTimeout = captureConfig.server.ready_timeout || 3 * 60 * 1_000; // 3 minutes

      const now = Date.now();
      const spinner = ora('Waiting for server to come online...');
      spinner.start();
      spinner.color = 'blue';

      const checkServer = (): Promise<boolean> =>
        fetch(readyUrl)
          .then((res) => String(res.status).startsWith('2'))
          .catch(() => false);

      let done = false;
      while (!done) {
        const isReady = await checkServer();
        if (isReady) {
          spinner.succeed('Server check passed');
          done = true;
        } else if (Date.now() > now + readyTimeout) {
          throw new UserError('Server check timed out.');
        }
        await wait(readyInterval);
      }
    }

    // make requests
    const captures = new GroupedCaptures(
      trafficDirectory,
      getEndpointsFromSpec(spec.jsonLike)
    );

    let requestsPromise: Promise<any> = Promise.resolve();
    let reqCmdPromise: Promise<void> = Promise.resolve();
    try {
      if (captureConfig.requests) {
        const requests = makeRequests(
          captureConfig.requests,
          proxyUrl,
          captureConfig.config?.request_concurrency || 5
        );
        requestsPromise = Promise.all(requests);
      }

      if (captureConfig.requests_command) {
        const cmd = commandSplitter(captureConfig.requests_command.command);
        const proxyVar =
          captureConfig.requests_command.proxy_variable || 'OPTIC_PROXY';
        process.env[proxyVar] = proxyUrl;
        const reqCmd = spawn(cmd.cmd, cmd.args, {
          detached: true,
          shell: true,
        });

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
      }
    } catch (error) {
      logger.error(error);
    } finally {
      await Promise.all([requestsPromise, reqCmdPromise]);
      sourcesController.abort();
      if (app) {
        process.kill(-app.pid!);
      }
    }

    const harEntries = HarEntries.fromProxyInteractions(proxyInteractions);
    let count = 0;
    for await (const har of harEntries) {
      count++;
      captures.addHar(har);
      logger.debug(`Captured ${har.request.url}`);
    }
    await captures.writeHarFiles();

    logger.info(
      `${count} requests captured. Run \`optic update --all\` to document updates.`
    );

    // TODO start running endpoint by endpoint of captures
    // run update or verify
  };

async function createOpenAPIFile(filePath: string): Promise<boolean> {
  const specFile = createNewSpecFile('3.1.0');
  if (isJson(filePath)) {
    logger.info(`Initializing OpenAPI file at ${filePath}`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(specFile, null, 2));
    return true;
  } else if (isYaml(filePath)) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    logger.info(`Initializing OpenAPI file at ${filePath}`);
    await fs.writeFile(filePath, writeYaml(specFile));
    return true;
  } else {
    return false;
  }
}

function getEndpointsFromSpec(
  spec: OpenAPIV3.Document
): { method: string; path: string }[] {
  const endpoints: { method: string; path: string }[] = [];
  for (const [path, pathObj] of Object.entries(spec.paths)) {
    for (const method of Object.values(OpenAPIV3.HttpMethods)) {
      const methodObj = pathObj && pathObj[method as string];
      if (methodObj) {
        endpoints.push({ method, path });
      }
    }
  }
  return endpoints;
}

function makeRequests(
  reqs: Request[],
  proxyUrl: string,
  concurrency: number
): Promise<void>[] {
  const limiter = new Bottleneck({
    maxConcurrent: concurrency,
    minTime: 0,
  });

  return reqs.map(async (r) => {
    let verb = r.verb || 'GET';
    let opts = { method: verb };

    if (verb === 'POST') {
      opts['headers'] = {
        'content-type': 'application/json;charset=UTF-8',
      };
      opts['body'] = JSON.stringify(r.data || '{}');
    }

    return limiter.schedule(() =>
      fetch(`${proxyUrl}${r.path}`, opts)
        .then((response) => response.json())
        .catch((error) => {
          logger.error(error);
        })
    );
  });
}
