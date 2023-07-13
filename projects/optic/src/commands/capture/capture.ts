import chalk from 'chalk';
import { Command, Option } from 'commander';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { chdir } from 'process';
import path from 'path';
import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import Bottleneck from 'bottleneck';
import jsonpatch from 'fast-json-patch';

import { isJson, isYaml, writeYaml } from '@useoptic/openapi-io';
import ora from 'ora';
import urljoin from 'url-join';
import {
  CoverageNode,
  OpenAPIV3,
  OperationCoverage,
  UserError,
} from '@useoptic/openapi-utilities';
import { CaptureConfigData, Request } from '../../config';
import { HarEntries, ProxyInteractions } from '../oas/captures';
import { errorHandler } from '../../error-handler';

import { createNewSpecFile } from '../../utils/specs';
import { logger } from '../../logger';
import { OpticCliConfig } from '../../config';
import { clearCommand } from '../oas/capture-clear';
import { captureV1 } from '../oas/capture';
import { getCaptureStorage, GroupedCaptures } from './storage';
import { loadSpec } from '../../utils/spec-loaders';
import { updateExistingEndpoint } from './interactions/documented';
import { ApiCoverageCounter } from '../oas/coverage/api-coverage';
import { commandSplitter } from '../../utils/capture';
import {
  documentNewEndpoint,
  promptUserForPathPattern,
} from './interactions/undocumented';
import { OPTIC_PATH_IGNORE_KEY } from '../../constants';
import { specToOperations } from '../oas/operations/queries';
import { SpecFiles } from '../oas/specs';
import { updateSpecFiles } from '../oas/diffing/document';

const indent = (n: number) => '  '.repeat(n);
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
    .option(
      '-u, --update',
      'update the OpenAPI spec to match the traffic',
      false
    )
    .option(
      '-i, --interactive',
      'add new endpoints in interactive mode. must be run with --update',
      false
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
  update: boolean;
  interactive: boolean;
};

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

const getCaptureAction =
  (config: OpticCliConfig, command: Command) =>
  async (
    filePath: string,
    targetUrl: string | undefined,
    options: CaptureActionOptions
  ) => {
    // TODO capturev2 - handle relative path from root (tbd - what do we do when we handle this outside of a git repo)
    const captureConfig = config.capture?.[filePath];

    // capture v1
    if (targetUrl !== undefined) {
      await captureV1(filePath, targetUrl, config, command);
      return;
    }

    // verify capture v2 config is present
    if (targetUrl !== undefined || captureConfig === undefined) {
      logger.error(`no capture config for ${filePath} was found`);
      // TODO log error and run capture init or something - tbd what the first use is
      process.exitCode = 1;
      return;
    }

    // verify that capture.requests or capture.requests_command is set
    if (!captureConfig.requests && !captureConfig.requests_command) {
      logger.error(
        `"requests" or "requests_command" must be specified in optic.yml`
      );
      process.exitCode = 1;
      return;
    }

    // verify port number is valid
    if (options.proxyPort && isNaN(Number(options.proxyPort))) {
      logger.error(
        `--proxy-port must be a number - received ${options.proxyPort}`
      );
      process.exitCode = 1;
      return;
    }

    const trafficDirectory = await setup(filePath);
    logger.debug(`Writing captured traffic to ${trafficDirectory}`);

    // start proxy
    const proxy = new ProxyInstance(
      options.serverOverride || captureConfig.server.url
    );
    await proxy.start(
      options.proxyPort ? Number(options.proxyPort) : undefined
    );

    // parse optic.yml
    let spec = await loadSpec(filePath, config, {
      strict: false,
      denormalize: false,
    });

    // start app
    let app: ChildProcessWithoutNullStreams | undefined;
    if (!options.serverOverride && captureConfig.server.command) {
      const serverDir =
        captureConfig.server.dir === undefined
          ? config.root
          : captureConfig.server.dir;
      const timeout = captureConfig.server.ready_timeout || 3 * 60 * 1_000; // 3 minutes
      const readyInterval = captureConfig.server.ready_interval || 1000;

      app = await startApp(
        captureConfig.server.command,
        serverDir,
        captureConfig.server.ready_endpoint,
        readyInterval,
        timeout,
        proxy.targetUrl
      );
    }

    // make requests
    let errors: any[] = [];
    try {
      let [sendRequestsPromise, runRequestsPromise] = makeAllRequests(
        captureConfig,
        proxy
      );
      await Promise.all([sendRequestsPromise, runRequestsPromise]);
    } catch (error) {
      errors.push(error);
    } finally {
      proxy.stop();
      if (app) {
        process.kill(-app.pid!);
      }

      if (errors.length > 0) {
        logger.error('finished with errors:');
        errors.forEach((error, index) => {
          logger.error(`${index}:\n${error}`);
        });
      }
    }

    // process proxy interactions into hars
    const harEntries = HarEntries.fromProxyInteractions(proxy.interactions);
    const captures = new GroupedCaptures(
      trafficDirectory,
      specToOperations(spec.jsonLike).flatMap((o) =>
        o.methods.map((m) => ({ method: m, path: o.pathPattern }))
      )
    );
    for await (const har of harEntries) {
      captures.addHar(har);
      logger.debug(
        `Captured ${har.request.method.toUpperCase()} ${har.request.url}`
      );
    }
    await captures.writeHarFiles();

    // update existing endpoints
    let hasAnyEndpointDiffs = false;
    const coverage = new ApiCoverageCounter(spec.jsonLike);
    // Handle interactions for documented endpoints first
    for (const {
      interactions,
      endpoint,
    } of captures.getDocumentedEndpointInteractions()) {
      const { path, method } = endpoint;
      const endpointText = `${method.toUpperCase()} ${path}`;
      const spinner = ora({ text: endpointText, color: 'blue' }).start();
      const { patchSummaries, hasDiffs } = await updateExistingEndpoint(
        interactions,
        spec,
        coverage,
        endpoint,
        options
      );
      hasAnyEndpointDiffs = hasAnyEndpointDiffs || hasDiffs;
      let endpointCoverage = coverage.coverage.paths[path][method];
      if (options.update) {
        // Since we flush each endpoint updates to disk, we should reload the spec to get the latest spec and sourcemap which we both use to generate the next set of patches
        spec = await loadSpec(filePath, config, {
          strict: false,
          denormalize: false,
        });
        const operation = spec.jsonLike.paths[path]?.[method];
        if (operation) {
          coverage.addEndpoint(operation, path, method, {
            newlyDocumented: true,
          });
          endpointCoverage = coverage.coverage.paths[path][method];
        }
        spinner.succeed(endpointText);
      } else {
        !hasDiffs ? spinner.succeed(endpointText) : spinner.fail(endpointText);
      }
      const summaryText = getSummaryText(endpointCoverage);
      summaryText && logger.info(indent(1) + summaryText);
      for (const patchSummary of patchSummaries) {
        logger.info(indent(1) + patchSummary);
      }
    }
    const endpointCounts = captures.counts();
    if (endpointCounts.total > 0 && endpointCounts.unmatched > 0) {
      logger.info(
        chalk.gray(
          `...and ${endpointCounts.unmatched} other endpoint${
            endpointCounts.unmatched === 1 ? '' : 's'
          }`
        )
      );
    }

    // document new endpoints
    if (options.update && options.interactive) {
      logger.info('');
      logger.info(
        chalk.bold.gray('Learning path patterns for unmatched requests...')
      );
      const {
        interactions: filteredInteractions,
        ignorePaths: newIgnorePaths,
        endpointsToAdd,
      } = await promptUserForPathPattern(
        captures.getUndocumentedInteractions(),
        spec.jsonLike
      );

      logger.info(chalk.bold.gray('Documenting new operations:'));

      for (const endpoint of endpointsToAdd) {
        const { path, method } = endpoint;
        const endpointText = `${method.toUpperCase()} ${path}`;
        const spinner = ora({ text: endpointText, color: 'blue' }).start();

        await documentNewEndpoint(filteredInteractions, spec, endpoint);

        // Since we flush each endpoint updates to disk, we should reload the spec to get the latest spec and sourcemap which we both use to generate the next set of patches
        spec = await loadSpec(filePath, config, {
          strict: false,
          denormalize: false,
        });
        spinner.succeed();
      }

      const existingIgnorePaths = Array.isArray(
        spec.jsonLike[OPTIC_PATH_IGNORE_KEY]
      )
        ? spec.jsonLike[OPTIC_PATH_IGNORE_KEY]
        : [];
      const ignorePaths = existingIgnorePaths.push(...newIgnorePaths);

      // TODO Write the ignore paths to the spec
    } else if (captures.unmatched.hars.length) {
      logger.info('');
      logger.info(`${captures.unmatched.hars.length} unmatched interactions`);
    }

    if (
      captures.unmatched.hars.length &&
      !(options.update && options.interactive)
    ) {
      logger.info(
        chalk.yellow('New endpoints are only added in interactive mode.')
      );
      logger.info(
        chalk.blue('Run with `--update --interactive` to add new endpoints')
      );
      logger.info(
        chalk.yellow(`optic capture ${filePath} --update --interactive`)
      );
    } else if (
      !options.update &&
      (captures.unmatched.hars.length || hasAnyEndpointDiffs)
    ) {
      logger.info(chalk.blue('Run with `--update --interactive` to update'));
      logger.info(
        chalk.yellow(`optic capture ${filePath} --update --interactive`)
      );
      process.exitCode = 1;
    }
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

function getSummaryText(endpointCoverage: OperationCoverage) {
  const getIcon = (node: CoverageNode) =>
    node.seen ? (node.diffs ? chalk.red('× ') : chalk.green('✓ ')) : '';
  const items: string[] = [];
  if (endpointCoverage.requestBody) {
    const icon = getIcon(endpointCoverage.requestBody);
    items.push(`${icon}Request Body`);
  }
  for (const [statusCode, node] of Object.entries(endpointCoverage.responses)) {
    const icon = getIcon(node);
    items.push(`${icon}${statusCode} response`);
  }
  return items.join();
}

function sendRequests(
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

async function runRequestsCommand(
  command: string,
  proxyVar: string,
  proxyUrl: string
): Promise<void> {
  const cmd = commandSplitter(command);
  process.env[proxyVar] = proxyUrl;
  const reqCmd = spawn(cmd.cmd, cmd.args, {
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
  if (captureConfig.requests) {
    const requests = sendRequests(
      captureConfig.requests,
      proxy.url,
      captureConfig.config?.request_concurrency || 5
    );
    sendRequestsPromise = Promise.allSettled(requests);
  }

  // run requests command
  let runRequestsPromise: Promise<void> = Promise.resolve();
  if (captureConfig.requests_command) {
    const proxyVar =
      captureConfig.requests_command.proxy_variable || 'OPTIC_PROXY';

    runRequestsPromise = runRequestsCommand(
      captureConfig.requests_command.command,
      proxyVar,
      proxy.url
    );
  }

  return [sendRequestsPromise, runRequestsPromise];
}

async function serverReady(
  checkUrl: string,
  interval: number,
  timeout: number
) {
  const now = Date.now();
  const spinner = ora('Waiting for server to come online...');
  spinner.start();
  spinner.color = 'blue';

  const checkServer = (): Promise<boolean> =>
    fetch(checkUrl)
      .then((res) => String(res.status).startsWith('2'))
      .catch((e) => {
        logger.debug(e);
        return false;
      });

  let done = false;
  while (!done) {
    const isReady = await checkServer();
    if (isReady) {
      spinner.succeed('Server check passed');
      done = true;
    } else if (Date.now() > now + timeout) {
      throw new UserError('Server check timed out.');
    }
    await wait(interval);
  }
}

async function specExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
  } catch {
    return false;
  }
  return true;
}

async function setup(filePath: string): Promise<string> {
  const resolvedPath = path.resolve(filePath);
  const oasSpecExists = await specExists(resolvedPath);
  if (!oasSpecExists) {
    const fileCreated = await createOpenAPIFile(filePath);
    if (!fileCreated) {
      logger.error('Could not create OpenAPI file');
      process.exit(1);
    }
  }
  return await getCaptureStorage(resolvedPath);
}

async function startApp(
  command: string,
  dir: string,
  readyEndpoint: string | undefined,
  readyInterval: number,
  readyTimeout: number,
  targetUrl: string
): Promise<ChildProcessWithoutNullStreams | undefined> {
  const cmd = commandSplitter(command);
  const app = spawn(cmd.cmd, cmd.args, { detached: true, cwd: dir });

  app.stderr.on('data', (data) => {
    logger.error(data.toString());
  });
  // since ready_endpoint is not required always wait one interval. without ready_endpoint,
  // ready_interval must be at least the time it takes to start the server.
  await wait(readyInterval);

  //
  // wait for the app to be ready
  //
  if (readyEndpoint) {
    const url = urljoin(targetUrl, readyEndpoint);
    const timeout = readyTimeout || 3 * 60 * 1_000; // 3 minutes
    await serverReady(url, readyInterval, timeout);
  }

  return app;
}
