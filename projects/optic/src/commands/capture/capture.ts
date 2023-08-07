import chalk from 'chalk';
import { Command, Option } from 'commander';
import path from 'path';
import fs from 'node:fs/promises';
import fsNonPromise from 'node:fs';

import { isJson, isYaml, writeYaml } from '@useoptic/openapi-io';
import { CoverageNode, OperationCoverage } from '@useoptic/openapi-utilities';
import { errorHandler } from '../../error-handler';

import { createNewSpecFile } from '../../utils/specs';
import { logger } from '../../logger';
import { OpticCliConfig, VCS } from '../../config';
import { clearCommand } from '../oas/capture-clear';
import { initCommand } from './capture-init';
import { captureV1 } from '../oas/capture';

import { getCaptureStorage } from './storage';
import { loadSpec } from '../../utils/spec-loaders';
import { ApiCoverageCounter } from './coverage/api-coverage';
import { HarEntries } from './sources/har';
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
import { InferPathStructure } from './operations/infer-path-structure';
import { getSpinner } from '../../utils/spinner';
import { getOpticUrlDetails } from '../../utils/cloud-urls';
import sortBy from 'lodash.sortby';

const indent = (n: number) => '  '.repeat(n);

export function registerCaptureCommand(cli: Command, config: OpticCliConfig) {
  const command = new Command('capture');

  command.addCommand(clearCommand());
  command.addCommand(initCommand(config));

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
    .addOption(
      new Option(
        '-u, --update [mode]',
        'update the OpenAPI spec to match the traffic. specify the mode to change the update behavior on how to handle undocumented endpoints (endpoints not in your spec). \
 documented will only update documented endpoints. interactive will prompt you for new endpoint paths. automatic will guess the correct path'
      )
        .preset('documented')
        .choices(['interactive', 'automatic', 'documented'])
    )
    .option(
      '--postman  <postman-collection-file>',
      'path to postman collection'
    )
    .option('--har <har-file>', 'path to har file (v1.2, v1.3)')
    .option('--verbose', 'display verbose diff output', false)

    .addOption(
      new Option(
        '-s, --server-override <url>',
        'Skip executing `capture[].server.command` and forward proxy traffic to this URL instead'
      )
    )
    .option('--upload', 'upload coverage results to Optic Cloud', false)
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
    .action(
      errorHandler(getCaptureAction(config, command), { command: 'capture' })
    );

  cli.addCommand(command);
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
          `optic capture <filepath> <url> is deprecated. Start using the new capture flow by running optic capture init ${filePath}`
        )
      );
      await captureV1(filePath, targetUrl, config, command);
      return;
    }

    const trafficDirectory = await setup(filePath);
    logger.debug(`Writing captured traffic to ${trafficDirectory}`);
    let spec = await loadSpec(filePath, config, {
      strict: false,
      denormalize: false,
    });
    const captures = new GroupedCaptures(trafficDirectory, spec.jsonLike);
    const pathFromRoot = resolveRelativePath(config.root, filePath);
    const captureConfig = config.capture?.[pathFromRoot];

    if (options.har) {
      try {
        const harEntries = HarEntries.fromReadable(
          fsNonPromise.createReadStream(options.har)
        );
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
        // TODO log error and run capture init or something - tbd what the first use is
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

      const harEntries = await captureRequestsFromProxy(
        config,
        captureConfig,
        options
      );
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

    const { unmatched: unmatchedInteractions, total: totalInteractions } =
      captures.interactionCount();

    if (totalInteractions === 0) {
      logger.error(
        chalk.red('Error: No requests were captured by the Optic proxy')
      );
      if (captureConfig?.requests?.run) {
        logger.error(
          `Check that you are sending requests to the Optic proxy. You can see where the Optic proxy is running by using the ${
            captureConfig?.requests?.run.proxy_variable ?? 'OPTIC_PROXY'
          } environment variable`
        );
      } else if (captureConfig?.requests?.send) {
        logger.error(
          `Check that you are sending at least one request in your send configuration. Using config`
        );
        logger.error(captureConfig?.requests?.send);
      }
      process.exitCode = 1;
      return;
    }

    // update existing endpoints
    const coverage = new ApiCoverageCounter(spec.jsonLike);
    let diffCount = 0;
    // Handle interactions for documented endpoints first
    const interactionsToLog = sortBy(
      [...captures.getDocumentedEndpointInteractions()],
      ({ endpoint }) => `${endpoint.path}${endpoint.method}`
    );

    for (const { interactions, endpoint } of interactionsToLog) {
      const { path, method } = endpoint;
      const endpointText = `${method.toUpperCase()} ${path}`;
      const spinner = getSpinner({
        text: endpointText,
        color: 'blue',
      })?.start();
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
        spinner?.succeed(endpointText);
      } else {
        if (!hasDiffs) {
          spinner?.succeed(endpointText);
        } else {
          process.exitCode = 1;
          spinner?.fail(endpointText);
        }
      }
      const summaryText = getSummaryText(endpointCoverage);
      summaryText && logger.info(indent(1) + summaryText);
      for (const patchSummary of patchSummaries) {
        logger.info(indent(1) + patchSummary);
      }
      diffCount += patchSummaries.length;
    }
    const endpointCounts = captures.counts();
    if (endpointCounts.total > 0 && endpointCounts.unmatched > 0) {
      const unmatchedEndpointsText = `${endpointCounts.unmatched} endpoint${
        endpointCounts.unmatched === 1 ? '' : 's'
      }`;
      if (endpointCounts.matched > 0) {
        logger.info(
          chalk.gray(
            `...and ${unmatchedEndpointsText} that did not receive traffic`
          )
        );
      } else {
        logger.info(
          chalk.gray(`${unmatchedEndpointsText} did not receive traffic`)
        );
      }
    }

    // document new endpoints
    if (unmatchedInteractions) {
      if (options.update === 'interactive' || options.update === 'automatic') {
        logger.info('');
        logger.info(
          chalk.bold.gray('Learning path patterns for unmatched requests...')
        );
        const inferredPathStructure =
          await InferPathStructure.fromSpecAndInteractions(
            spec.jsonLike,
            captures.getUndocumentedInteractions()
          );
        const {
          interactions: filteredInteractions,
          ignorePaths: newIgnorePaths,
          endpointsToAdd,
        } = await promptUserForPathPattern(
          captures.getUndocumentedInteractions(),
          spec.jsonLike,
          inferredPathStructure,
          { update: options.update }
        );

        logger.info(chalk.bold.gray('Documenting new operations:'));

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
          spec = await loadSpec(filePath, config, {
            strict: false,
            denormalize: false,
          });
          spinner?.succeed();
        }

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

      logger.info();
      logger.info(`${coverageText} ${requestsText}`);
      diffCount !== 0 &&
        logger.info(`${diffCount} diffs detected in documented operations`);
      logger.info();
    } else if (options.update === 'documented' && unmatchedInteractions > 0) {
      logger.info();
      logger.info(`${unmatchedInteractions} unmatched requests`);
    }

    if (options.upload) {
      if (options.update) {
        logger.error(
          'optic capture --upload cannot be run with the --update flag'
        );
        process.exitCode = 1;
        return;
      }

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

    if (
      unmatchedInteractions &&
      (options.update === 'documented' || !options.update)
    ) {
      logger.info(
        chalk.yellow('New endpoints are only added in interactive mode.')
      );
      logger.info(
        chalk.blue('Run with `--update interactive` to add new endpoints')
      );
      logger.info(
        chalk.yellow(`Hint: optic capture ${filePath} --update interactive`)
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
