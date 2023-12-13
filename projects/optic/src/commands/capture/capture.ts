import chalk from 'chalk';
import { Command, Option } from 'commander';
import path from 'path';
import fs from 'node:fs/promises';
import fsNonPromise from 'node:fs';

import { denormalize, isJson, isYaml, writeYaml } from '@useoptic/openapi-io';
import { CoverageNode, OperationCoverage } from '@useoptic/openapi-utilities';
import { errorHandler } from '../../error-handler';

import { createNewSpecFile } from '../../utils/specs';
import { logger } from '../../logger';
import { CaptureConfigData, OpticCliConfig, VCS } from '../../config';
import { clearCommand } from '../oas/capture-clear';
import { initCommand } from './capture-init';
import { captureV1 } from '../oas/capture';

import { getCaptureStorage } from './storage';
import { ParseResult, loadSpec } from '../../utils/spec-loaders';
import { ApiCoverageCounter } from './coverage/api-coverage';
import { getHarEntriesFromFs } from './sources/har';
import {
  addIgnorePaths,
  documentNewEndpoint,
  promptUserForPathPattern,
  diffExistingEndpoint,
} from './actions';
import { captureRequestsFromProxy } from './actions/captureRequests';
import { PostmanCollectionEntries } from './sources/postman';
import { CapturedInteractions } from './sources/captured-interactions';
import * as AT from '../oas/lib/async-tools';
import { GroupedCaptures } from './interactions/grouped-interactions';
import { OPTIC_URL_KEY } from '../../constants';
import { uploadCoverage } from './actions/upload-coverage';
import { resolveRelativePath } from '../../utils/capture';
import { PathInference } from './operations/path-inference';
import { getSpinner } from '../../utils/spinner';
import { flushEvents, trackEvent } from '../../segment';
import { getOpticUrlDetails } from '../../utils/cloud-urls';
import sortBy from 'lodash.sortby';
import * as Git from '../../utils/git-utils';

const indent = (n: number) => '  '.repeat(n);

export function registerCaptureCommand(cli: Command, config: OpticCliConfig) {
  const command = cli.command('capture');

  command
    .argument('<openapi-file>', 'An OpenAPI spec file to add an operation to')
    .argument(
      '[target-url]',
      'The url to capture (deprecated, use optic.yml configuration instead)'
    )
    .description('Capture traffic using the configuration in optic.yml')
    .addOption(
      new Option(
        '-p, --proxy-port <proxy-port>',
        'Specify the port the proxy should be running on'
      ).default(8000)
    )
    .addOption(
      new Option(
        '-u, --update [mode]',
        `Update the OpenAPI spec based on the traffic. Mode selects the update behavior:
- documented: Update previously documented endpoints
- interactive: Prompt for new endpoints
- automatic: Automatically document new endpoints`
      )
        .preset('documented')
        .choices(['interactive', 'automatic', 'documented'])
    )
    .option('--postman <postman-collection-file>', 'Path to Postman collection')
    .option(
      '--har <har-file or directory>',
      'Path to har file (v1.2, v1.3), or directory containing har files'
    )
    .option('--verbose', 'Display verbose diff output', false)
    .option(
      '-s, --server-override <url>',
      'Skip executing `capture[].server.command` and forward proxy traffic to this URL instead'
    )
    .option('--upload', 'Upload coverage results to Optic Cloud', false)
    // TODO deprecate hidden options below
    .addOption(
      new Option(
        '--no-tls',
        'Disable TLS support for --proxy and prevent generation of new CA certificates'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '-r, --reverse-proxy',
        'Run optic capture in reverse proxy mode'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '--command <command>',
        'Command to run with the http_proxy and http_proxy configured'
      ).hideHelp()
    )
    .addOption(
      new Option(
        '-d, --debug',
        `Output debug information (on stderr). Use LOG_LEVEL env with 'debug', 'info' to increase verbosity.`
      ).hideHelp()
    )
    .addOption(
      new Option('-o, --output <output>', 'File name for output').hideHelp()
    )
    .action(
      errorHandler(getCaptureAction(config, command), {
        command: 'capture',
      })
    );

  // subcommands
  command.addCommand(clearCommand()).addCommand(initCommand(config));
}
type CaptureActionOptions = {
  proxyPort?: string;
  serverOverride?: string;
  postman?: string;
  har?: string;
  update?: 'documented' | 'interactive' | 'automatic';
  upload: boolean;
  verbose: boolean;
};

const getCaptureAction =
  (config: OpticCliConfig, command: Command) =>
  async (
    filePath: string,
    targetUrl: string | undefined,
    options: CaptureActionOptions
  ) => {
    // capture v1
    if (targetUrl !== undefined) {
      logger.warn(
        chalk.yellow.bold(
          `optic capture <filepath> <url> is deprecated. Start using the new capture flow by running "optic capture init ${filePath}"`
        )
      );
      await captureV1(filePath, targetUrl, config, command);
      return;
    }

    trackEvent('optic.capture.start', {
      input: options.har ? 'har' : options.postman ? 'postman' : 'capture',
      mode: options.update ?? 'verify',
      isInCi: config.isInCi,
    });

    const trafficDirectory = await setup(filePath);
    logger.debug(`Writing captured traffic to ${trafficDirectory}`);
    let spec = await loadSpec(filePath, config, {
      strict: false,
      denormalize: false,
    });
    let serverUrl: string | null = null;
    let captures: GroupedCaptures;
    const pathFromRoot = resolveRelativePath(config.root, filePath);
    const captureConfig = config.capture?.[pathFromRoot];

    if (options.har) {
      captures = new GroupedCaptures(trafficDirectory, spec.jsonLike);
      try {
        const harEntries = getHarEntriesFromFs(options.har);
        for await (const harOrErr of harEntries) {
          if (harOrErr.ok) {
            captures.addHar(harOrErr.val);
          } else {
            logger.debug(harOrErr.val);
          }
        }
      } catch (e) {
        logger.error(chalk.red(`Error parsing ${options.har}`));
        logger.error(e);
        process.exitCode = 1;
        return;
      }
    } else if (options.postman) {
      captures = new GroupedCaptures(trafficDirectory, spec.jsonLike);
      const postmanEntryResults = PostmanCollectionEntries.fromReadable(
        fsNonPromise.createReadStream(options.postman)
      );
      let postmanEntries = AT.unwrapOr(postmanEntryResults, (err) => {
        logger.debug(err);
      });

      for await (const interaction of CapturedInteractions.fromPostmanCollection(
        postmanEntries
      )) {
        captures.addInteraction(interaction);
      }
    } else {
      // verify capture v2 config is present
      if (targetUrl !== undefined || captureConfig === undefined) {
        const initSuggestion = `'optic capture init ${filePath}'`;
        config.isDefaultConfig
          ? logger.error(
              `An optic.yml file wasn't found. To create an optic.yml file with a default capture block, run ${initSuggestion}.`
            )
          : logger.error(
              `Expected a capture config entry for ${pathFromRoot}. To add a capture config entry to your optic.yml, run ${initSuggestion}.`
            );
        process.exitCode = 1;
        return;
      }

      // verify that capture.requests or capture.requests_command is set
      if (!captureConfig.requests?.run && !captureConfig.requests?.send) {
        logger.error(
          `"requests.send" or "requests.run" must be specified in optic.yml`
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
      serverUrl = options.serverOverride || captureConfig.server.url;
      captures = new GroupedCaptures(trafficDirectory, spec.jsonLike, {
        baseServerUrl: serverUrl,
      });
      const harEntries = await captureRequestsFromProxy(config, captureConfig, {
        ...options,
        serverUrl,
      });
      if (!harEntries) {
        // Error thrown where we don't have requests
        process.exitCode = 1;
        return;
      }
      for await (const har of harEntries) {
        captures.addHar(har);
        logger.debug(
          `Captured ${har.request.method.toUpperCase()} ${har.request.url}`
        );
      }
      await captures.writeHarFiles();
    }

    const captureOutput = await processCaptures(
      {
        cliConfig: config,
        captureConfig: captureConfig,
        spec,
        filePath,
        captures,
      },
      { ...options, bufferLogs: false }
    );

    if (!captureOutput.success) {
      process.exitCode = 1;
      return;
    }
    const {
      unmatchedInteractions,
      totalInteractions,
      coverage,
      endpointsAdded,
      hasAnyDiffs,
      endpointCounts,
    } = captureOutput;

    const maybeOrigin =
      config.vcs?.type === VCS.Git ? await Git.guessRemoteOrigin() : null;
    const relativePath = path.relative(config.root, path.resolve(filePath));

    trackEvent('optic.capture.completed', {
      input: options.har ? 'har' : options.postman ? 'postman' : 'capture',
      mode: options.update ?? 'verify',
      serverUrl,
      captureCmd: captureConfig?.requests.run?.command ?? null,
      captureRequests: captureConfig?.requests.send?.length ?? 0,
      interactionCount: totalInteractions,
      endpointsAdded,
      endpointsUpdated: options.update ? endpointCounts.total : 0,
      isInCi: config.isInCi,
      upload: options.upload,
      ...(maybeOrigin?.web_url
        ? {
            webUrlAndPath: `${maybeOrigin.web_url}.${relativePath}`,
            webUrl: maybeOrigin.web_url,
          }
        : {}),
    });

    if (options.upload) {
      if (options.update) {
        logger.error(
          'optic capture --upload cannot be run with the --update flag'
        );
        process.exitCode = 1;
        return;
      }
      // We need to load the spec as is with denormalize=true so that the endpoint shas match
      spec = denormalize(spec);

      const opticUrlDetails = await getOpticUrlDetails(config, {
        filePath: path.relative(config.root, path.resolve(filePath)),
        opticUrl: spec.jsonLike[OPTIC_URL_KEY],
      });

      if (config.vcs?.type !== VCS.Git) {
        logger.error(
          'optic capture --upload can only be run in a git repository.'
        );
        process.exitCode = 1;
        return;
      }

      if (!opticUrlDetails) {
        logger.error(
          `File ${filePath} could not be associated with an Optic API. Files must be added to Optic before verification data can be uploaded.`
        );
        logger.error(`${chalk.yellow('Hint: ')} Run optic api add ${filePath}`);
        process.exitCode = 1;
        return;
      }

      const { specUrl, branchTag } = await uploadCoverage(
        spec,
        coverage,
        opticUrlDetails,
        config
      );
      logger.info(
        `Successfully uploaded verification data ${
          branchTag ? `for tag '${branchTag}'` : ''
        }. View your spec at ${specUrl}`
      );
    }
    if (hasAnyDiffs) {
      process.exitCode = 1;
    }

    if (
      unmatchedInteractions &&
      (options.update === 'documented' || !options.update)
    ) {
      logger.info('');
      logger.info(
        chalk.yellow(
          `New endpoints are only added in interactive mode. Run 'optic capture ${filePath} --update interactive' to add new endpoints`
        )
      );
      process.exitCode = 1;
    }

    await flushEvents();
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
  const coverageResponses = sortBy(
    Object.entries(endpointCoverage.responses),
    ([statusCode]) => statusCode
  );
  for (const [statusCode, node] of coverageResponses) {
    const icon = getIcon(node);
    items.push(`${icon}${statusCode} response`);
  }
  return items.join(', ');
}

async function setup(filePath: string): Promise<string> {
  const resolvedPath = path.resolve(filePath);
  let openApiExists = false;

  try {
    await fs.stat(resolvedPath);
    openApiExists = true;
  } catch (e) {}

  if (!openApiExists) {
    const fileCreated = await createOpenAPIFile(filePath);
    if (!fileCreated) {
      logger.error('Could not create OpenAPI file');
      process.exit(1);
    }
  }
  return await getCaptureStorage(resolvedPath);
}

export async function processCaptures(
  {
    captureConfig,
    cliConfig,
    captures,
    spec,
    filePath,
  }: {
    filePath: string;
    spec: ParseResult;
    captures: GroupedCaptures;
    captureConfig?: CaptureConfigData;
    cliConfig: OpticCliConfig;
  },
  options: Pick<CaptureActionOptions, 'update' | 'verbose'> & {
    bufferLogs: boolean;
  }
): Promise<
  | {
      unmatchedInteractions: number;
      totalInteractions: number;
      coverage: ApiCoverageCounter;
      endpointsAdded: number;
      mismatchedEndpoints: number;
      endpointCounts: {
        total: number;
        unmatched: number;
        matched: number;
      };
      bufferedOutput: string[];
      hasAnyDiffs: boolean;
      success: true;
    }
  | { success: false; bufferedOutput: string[] }
> {
  const bufferedOutput: string[] = [];
  const { unmatched: unmatchedInteractions, total: totalInteractions } =
    captures.interactionCount();

  if (totalInteractions === 0) {
    const errorMsg = chalk.red(
      'Error: No requests were captured by the Optic proxy'
    );
    options.bufferLogs ? bufferedOutput.push(errorMsg) : logger.error(errorMsg);
    if (captureConfig?.requests?.run) {
      const helpMsg = `Check that you are sending requests to the Optic proxy. You can see where the Optic proxy is running by using the ${
        captureConfig?.requests?.run.proxy_variable ?? 'OPTIC_PROXY'
      } environment variable`;
      options.bufferLogs ? bufferedOutput.push(helpMsg) : logger.error(helpMsg);
    } else if (captureConfig?.requests?.send) {
      const helpMsg = `Check that you are sending at least one request in your send configuration. Using config`;
      options.bufferLogs ? bufferedOutput.push(helpMsg) : logger.error(helpMsg);
      options.bufferLogs
        ? bufferedOutput.push(JSON.stringify(captureConfig?.requests?.send))
        : logger.error(captureConfig?.requests?.send);
    }
    return { bufferedOutput, success: false };
  }

  // update existing endpoints
  const coverage = new ApiCoverageCounter(denormalize(spec).jsonLike);
  let hasAnyDiffs = false;
  let diffCount = 0;
  let endpointsAdded = 0;
  let mismatchedEndpoints = new Set<string>();

  // Handle interactions for documented endpoints first
  const interactionsToLog = sortBy(
    [...captures.getDocumentedEndpointInteractions()],
    ({ endpoint }) => `${endpoint.path}${endpoint.method}`
  );

  for (const { interactions, endpoint } of interactionsToLog) {
    const { path, method } = endpoint;
    const endpointText = `${method.toUpperCase()} ${path}`;
    const spinner = !options.bufferLogs
      ? getSpinner({
          text: endpointText,
          color: 'blue',
        })?.start()
      : (bufferedOutput.push(endpointText), undefined);
    const { patchSummaries, hasDiffs } = await diffExistingEndpoint(
      interactions,
      spec,
      coverage,
      endpoint,
      options
    );

    let endpointCoverage = coverage.coverage.paths[path][method];
    if (options.update) {
      // Since we flush each endpoint updates to disk, we should reload the spec to get the latest spec and sourcemap which we both use to generate the next set of patches
      spec = await loadSpec(filePath, cliConfig, {
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
      spinner?.succeed(endpointText);
    } else {
      if (!hasDiffs) {
        spinner?.succeed(endpointText);
      } else {
        mismatchedEndpoints.add(`${method}-${path}`);
        hasAnyDiffs = true;
        spinner?.fail(endpointText);
      }
    }
    const summaryText = getSummaryText(endpointCoverage);
    summaryText && options.bufferLogs
      ? bufferedOutput.push(indent(1) + summaryText)
      : logger.info(indent(1) + summaryText);
    for (const patchSummary of patchSummaries) {
      options.bufferLogs
        ? bufferedOutput.push(indent(1) + patchSummary)
        : logger.info(indent(1) + patchSummary);
    }
    diffCount += patchSummaries.length;
  }
  const endpointCounts = captures.counts();
  if (endpointCounts.total > 0 && endpointCounts.unmatched > 0) {
    const unmatchedEndpointsText = `${endpointCounts.unmatched} endpoint${
      endpointCounts.unmatched === 1 ? '' : 's'
    }`;
    if (endpointCounts.matched > 0) {
      const txt = chalk.gray(
        `...and ${unmatchedEndpointsText} that did not receive traffic`
      );
      options.bufferLogs ? bufferedOutput.push(txt) : logger.info(txt);
    } else {
      const txt = chalk.gray(
        `${unmatchedEndpointsText} did not receive traffic`
      );
      options.bufferLogs ? bufferedOutput.push(txt) : logger.info(txt);
    }
  }

  // document new endpoints
  if (unmatchedInteractions) {
    if (options.update === 'interactive' || options.update === 'automatic') {
      options.bufferLogs ? bufferedOutput.push('') : logger.info('');
      const summary = chalk.bold.gray(
        'Learning path patterns for unmatched requests...'
      );
      options.bufferLogs ? bufferedOutput.push(summary) : logger.info(summary);
      const inferredPathStructure = await PathInference.fromSpecAndInteractions(
        spec.jsonLike,
        captures.getUndocumentedInteractions()
      );
      const {
        interactions: filteredInteractions,
        ignorePaths: newIgnorePaths,
        endpointsToAdd,
      } = await promptUserForPathPattern(
        captures.getUndocumentedInteractions(),
        inferredPathStructure,
        { update: options.update }
      );
      const header = chalk.bold.gray('Documenting new operations:');
      options.bufferLogs ? bufferedOutput.push(header) : logger.info(header);

      for (const endpoint of sortBy(
        endpointsToAdd,
        (e) => `${e.path}${e.method}`
      )) {
        const { path, method } = endpoint;
        const endpointText = `${method.toUpperCase()} ${path}`;
        const spinner = getSpinner({
          text: endpointText,
          color: 'blue',
        })?.start();

        await documentNewEndpoint(filteredInteractions, spec, endpoint);

        // Since we flush each endpoint updates to disk, we should reload the spec to get the latest spec and sourcemap which we both use to generate the next set of patches
        spec = await loadSpec(filePath, cliConfig, {
          strict: false,
          denormalize: false,
        });
        spinner?.succeed();
      }

      endpointsAdded = endpointsToAdd.length;
      if (newIgnorePaths.length) {
        await addIgnorePaths(spec, newIgnorePaths);
      }
    }
  }

  if (!options.update) {
    const coverageStats = coverage.calculateCoverage();
    const coverageText = `${coverageStats.percent}% coverage of your documented operations.`;
    const requestsText =
      unmatchedInteractions === 0
        ? `All requests matched a documented path (${totalInteractions} total requests)`
        : `${unmatchedInteractions} requests did not match a documented path (${totalInteractions} total requests).`;

    const diffText = `${diffCount} diffs detected in documented operations`;
    options.bufferLogs ? bufferedOutput.push('') : logger.info();
    options.bufferLogs
      ? bufferedOutput.push(`${coverageText} ${requestsText}`)
      : logger.info(`${coverageText} ${requestsText}`);
    diffCount !== 0 &&
      (options.bufferLogs
        ? bufferedOutput.push(diffText)
        : logger.info(diffText));
  } else if (options.update === 'documented' && unmatchedInteractions > 0) {
    const unmatchedText = `${unmatchedInteractions} unmatched requests`;
    options.bufferLogs ? bufferedOutput.push('') : logger.info();
    options.bufferLogs
      ? bufferedOutput.push(unmatchedText)
      : logger.info(unmatchedText);
  }

  return {
    unmatchedInteractions,
    totalInteractions,
    coverage,
    endpointsAdded,
    mismatchedEndpoints: mismatchedEndpoints.size,
    endpointCounts,
    bufferedOutput,
    hasAnyDiffs,
    success: true,
  };
}
