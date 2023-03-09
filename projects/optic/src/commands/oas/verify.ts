import { Command } from 'commander';
import Path from 'path';
import path from 'path';
import * as fs from 'fs-extra';

import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { flushEvents, trackEvent } from './lib/segment';
import { trackWarning } from './lib/sentry';
import * as AT from './lib/async-tools';
import { OpenAPIV3, readDeferencedSpec } from './specs';
import { CapturedInteractions, HarEntries } from './captures';
import { captureStorage } from './captures/capture-storage';
import chalk from 'chalk';
import {
  addIfUndocumented,
  matchInteractions,
  observationToUndocumented,
  StatusObservations,
} from './diffing/document';
import {
  patchOperationsAsNeeded,
  renderDiffs,
  updateByInteractions,
} from './diffing/patch';
import { specToOperations } from './operations/queries';
import { OpticCliConfig, VCS } from '../../config';
import { OPTIC_URL_KEY } from '../../constants';
import { getApiFromOpticUrl } from '../../utils/cloud-urls';
import { uploadSpec } from '../../utils/cloud-specs';
import { getFileFromFsOrGit } from '../../utils/spec-loaders';

export function verifyCommand(config: OpticCliConfig): Command {
  const command = new Command('verify');
  const feedback = createCommandFeedback(command);

  command
    .description('match observed traffic up to an OpenAPI spec')
    .argument(
      '<openapi-file>',
      'an OpenAPI spec to match up to observed traffic'
    )
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option('--exit0', 'always exit 0')
    .option('--document <operations>', 'HTTP method and path pair(s) to add')
    .option('--patch', 'Patch existing operations to resolve diffs')
    .option(
      '--upload',
      'Upload the verification data to optic cloud. Requires the spec to be in optic',
      false
    )
    .action(async (specPath) => {
      const analytics: { event: string; properties: any }[] = [];
      const options = command.opts();

      if (options.upload) {
        if (options.document || options.patch) {
          console.error(
            'Cannot run upload with --document or --patch options.'
          );
          process.exitCode = 1;
          return;
        } else if (
          config.vcs?.type !== VCS.Git ||
          config.vcs.status === 'dirty'
        ) {
          console.error(
            'Must be run in a git repository and in a working directory without uncommitted changes'
          );
          process.exitCode = 1;
          return;
        }
      }

      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return await feedback.inputError(
          'OpenAPI specification file could not be found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }

      console.log('');

      const makeInteractionsIterator = async () =>
        getInteractions(options, specPath, feedback);

      /// Add if --document or --update options passed
      if (options.document || options.patch) {
        if (options.document) {
          const specReadResult = await readDeferencedSpec(absoluteSpecPath);
          if (specReadResult.err) {
            return await feedback.inputError(
              `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`,
              InputErrors.SPEC_FILE_NOT_READABLE
            );
          }
          const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

          feedback.notable('Documenting operations...');

          let { observations } = matchInteractions(
            spec,
            await makeInteractionsIterator()
          );

          const result = await addIfUndocumented(
            options.document,
            observations,
            await makeInteractionsIterator(),
            spec,
            sourcemap
          );

          if (result.ok) {
            analytics.push({
              event: 'openapi.verify.document',
              properties: {
                allFlag: options.document === 'all',
                numberDocumented: result.val.length,
              },
            });
            result.val.map((operation) => {
              console.log(
                `${chalk.green('added')}  ${operation.method} ${
                  operation.pathPattern
                }`
              );
            });
          }
        }

        if (options.patch) {
          feedback.notable('Patching operations...');
          const specReadResult = await readDeferencedSpec(absoluteSpecPath);
          if (specReadResult.err) {
            return await feedback.inputError(
              `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`,
              InputErrors.SPEC_FILE_NOT_READABLE
            );
          }
          const { jsonLike: spec, sourcemap } = specReadResult.unwrap();
          const patchInteractions = await makeInteractionsIterator();
          const patchStats = await patchOperationsAsNeeded(
            patchInteractions,
            spec,
            sourcemap
          );
          analytics.push({
            event: 'openapi.verify.patch',
            properties: patchStats,
          });
        }

        console.log(chalk.gray('-'.repeat(process.stdout.columns) + '\n'));
      }

      /// Run to verify with the latest specification
      const parseResult = await getFileFromFsOrGit(absoluteSpecPath, config, {
        strict: false,
        denormalize: false,
      });

      const { jsonLike: spec, sourcemap } = parseResult;

      const opticUrlDetails = getApiFromOpticUrl(spec[OPTIC_URL_KEY]);

      const interactions = await makeInteractionsIterator();

      feedback.notable('Verifying API behavior...');

      let { results: updatePatches } = updateByInteractions(spec, interactions);

      let { observations, coverage } = matchInteractions(
        spec,
        await makeInteractionsIterator()
      );

      const renderingStatus = await renderOperationStatus(
        observations,
        spec,
        feedback
      );

      const diffResults = await renderDiffs(
        sourcemap,
        spec,
        updatePatches,
        coverage
      );

      const coverageStats = coverage.calculateCoverage();

      console.log('\n ' + chalk.bold.underline(`API Behavior Report`));
      console.log(`
 Total Requests          : ${coverageStats.totalRequests}
 Diffs                   : ${diffResults.shapeDiff}
 Undocumented operations : ${renderingStatus.undocumentedPaths}
 Undocumented bodies     : ${diffResults.undocumentedBody}\n`);

      coverage.renderCoverage();

      const hasDiff =
        diffResults.totalDiffCount + renderingStatus.undocumentedPaths > 0;

      analytics.push({
        event: 'openapi.verify',
        properties: {
          totalInteractions: coverageStats.totalRequests,
          coverage: coverageStats.percent,
          diffs: diffResults.totalDiffCount,
          shapeDiffs: diffResults.shapeDiff,
          undocumentedOperations: renderingStatus.undocumentedPaths,
          undocumentedBodies: renderingStatus.undocumentedPaths,
        },
      });

      if (options.upload) {
        if (!opticUrlDetails) {
          console.error(
            `File ${specPath} does not have an optic url. Files must be added to Optic and have an x-optic-url key before verification data can be uploaded.`
          );
          console.error(
            `${chalk.yellow('Hint: ')} Run optic api add ${specPath}`
          );
          process.exitCode = 1;
          return;
        }
        const { orgId, apiId } = opticUrlDetails;
        const specId = await uploadSpec(apiId, {
          spec: parseResult,
          client: config.client,
          tags: [], // TODO figure out what tags to add
          orgId,
        });
        // todo upload verification data
      }

      analytics.forEach((event) => trackEvent(event.event, event.properties));

      await flushEvents();

      // clear captures
      if ((options.document === 'all' || options.patch) && !options.har) {
        const [, captureStorageDirectory] = await captureStorage(specPath);
        console.log('Resetting captured traffic');
        await fs.remove(captureStorageDirectory);
      }

      if (Boolean(options.document) && !opticUrlDetails) {
        console.log('');
        console.log(
          chalk.gray(
            `Share a link to your API documentation with ${chalk.whiteBright(
              `optic api add ${specPath}`
            )}`
          )
        );
        console.log('');
      }

      if (!options.exit0 && hasDiff) {
        console.log(
          chalk.red('OpenAPI and implementation are out of sync. Exiting 1')
        );
        process.exit(1);
      }
      if (!hasDiff) {
        console.log(
          chalk.green.bold(
            'No diffs detected. OpenAPI and implementation appear to be in sync.'
          )
        );
      }
    });

  return command;
}

async function renderOperationStatus(
  observations: StatusObservations,
  spec: OpenAPIV3.Document,
  feedback: ReturnType<typeof createCommandFeedback>
) {
  const { pathsToAdd } = await observationToUndocumented(
    observations,
    specToOperations(spec)
  );

  let undocumentedPaths: number = 0;

  if (pathsToAdd.length) {
    for (let unmatchedPath of pathsToAdd) {
      undocumentedPaths++;
      unmatchedPath.methods.forEach((method) =>
        renderUndocumentedPath(
          method.toUpperCase(),
          unmatchedPath.pathPattern,
          unmatchedPath.examplePath
        )
      );
    }
    feedback.commandInstruction('--document all', 'to document these paths');
    feedback.commandInstruction(
      `--document "[method] [/path], ..."`,
      'to document one or more operations'
    );
  }

  return { undocumentedPaths };
  function operationId({ path, method }: { path: string; method: string }) {
    return `${method}${path}`;
  }
}

async function getInteractions(
  options: { har?: string },
  specPath: string,
  feedback: any
) {
  const sources: CapturedInteractions[] = [];

  const [, captureStorageDirectory] = await captureStorage(specPath);

  const captureDirectoryContents = (
    await fs.readdir(captureStorageDirectory)
  ).sort();

  // if HAR provided, only pullf rom there
  if (options.har) {
    // override with a har
    let absoluteHarPath = Path.resolve(options.har);
    if (!(await fs.pathExists(absoluteHarPath))) {
      return await feedback.inputError(
        'HAR file could not be found at given path',
        InputErrors.HAR_FILE_NOT_FOUND
      );
    }
    let harFile = fs.createReadStream(absoluteHarPath);
    let harEntryResults = HarEntries.fromReadable(harFile);
    let harEntries = AT.unwrapOr(harEntryResults, (err) => {
      let message = `HAR entry skipped: ${err.message}`;
      console.warn(message); // warn, skip and keep going
      trackWarning(message, err);
    });
    sources.push(CapturedInteractions.fromHarEntries(harEntries));
  } else {
    // default is capture directory
    captureDirectoryContents.forEach((potentialCapture) => {
      // completed captures only
      if (potentialCapture.endsWith('.har')) {
        let harFile = fs.createReadStream(
          path.join(captureStorageDirectory, potentialCapture)
        );
        let harEntryResults = HarEntries.fromReadable(harFile);
        let harEntries = AT.unwrapOr(harEntryResults, (err) => {
          let message = `HAR entry skipped: ${err.message}`;
          console.warn(message); // warn, skip and keep going
          trackWarning(message, err);
        });

        sources.push(CapturedInteractions.fromHarEntries(harEntries));
      }
    });
  }

  if (sources.length < 1) {
    return await feedback.inputError(
      'no traffic captured for this OpenAPI spec. Run "oas capture" command',
      InputErrors.CAPTURE_METHOD_MISSING
    );
  }

  return AT.merge(...sources);
}

function renderUndocumentedPath(
  method: string,
  pathPattern: string,
  examplePath: string
) {
  console.log(
    `${chalk.bgYellow('  Undocumented  ')} ${method
      .toUpperCase()
      .padStart(6, ' ')}   ${pathPattern}\n${''.padStart(
      26, // undocumented + method length
      ' '
    )}${chalk.gray(examplePath)}`
  );
}
