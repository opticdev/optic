import { Command } from 'commander';
import Path from 'path';
import path from 'path';
import * as fs from 'fs-extra';

import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { trackCompletion } from '../segment';
import { trackWarning } from '../sentry';
import * as AT from '../lib/async-tools';
import { readDeferencedSpec } from '../specs';
import { CapturedInteractions, HarEntries } from '../captures';
import { captureStorage } from '../captures/capture-storage';
import chalk from 'chalk';
import {
  addIfUndocumented,
  matchInteractions,
  observationToUndocumented,
  StatusObservationKind,
  StatusObservations,
} from './diffing/document';
import { updateByInteractions } from './update';
import { renderDiffs } from './diffing/update';

export async function verifyCommand({
  addUsage,
}: {
  addUsage: string;
}): Promise<Command> {
  const command = new Command('verify');
  const feedback = await createCommandFeedback(command);

  command
    .description('match observed traffic up to an OpenAPI spec')
    .argument(
      '<openapi-file>',
      'an OpenAPI spec to match up to observed traffic'
    )
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option('--document <operations>', 'HTTP method and path pair(s) to add')
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return await feedback.inputError(
          'OpenAPI specification file could not be found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }

      const options = command.opts();

      const makeInteractionsIterator = async () =>
        getInteractions(options, specPath, feedback);

      /// Add if --document or --update options passed
      if (options.document || options.update) {
        const specReadResult = await readDeferencedSpec(absoluteSpecPath);
        if (specReadResult.err) {
          await feedback.inputError(
            `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`,
            InputErrors.SPEC_FILE_NOT_READABLE
          );
        }
        const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

        if (options.document) {
          let observations: StatusObservations = matchInteractions(
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
        }

        if (options.update) {
          console.log('UPDATE NOT IMPLEMENTED YET!!!');
        }
      }

      /// Run to verify with the latest specification
      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        await feedback.inputError(
          `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`,
          InputErrors.SPEC_FILE_NOT_READABLE
        );
      }

      const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

      const interactions = await makeInteractionsIterator();
      let observations = matchInteractions(spec, interactions);

      let observationsFork = AT.forkable(observations);

      const renderingStatus = renderOperationStatus(
        observationsFork.fork(),
        feedback,
        {
          addUsage,
        }
      );

      let { results: updatePatches, observations: updateObservations } =
        updateByInteractions(spec, interactions, 1);

      const trackingStats = trackStats(observationsFork.fork());
      observationsFork.start();

      const results = await renderDiffs(sourcemap, updatePatches);

      console.log(results);

      await Promise.all([renderingStatus, trackingStats]);
    });

  return command;
}

async function renderOperationStatus(
  observations: StatusObservations,
  feedback: Awaited<ReturnType<typeof createCommandFeedback>>,
  { addUsage }: { addUsage: string }
) {
  const { pathsToAdd, pathDiffs } = await observationToUndocumented(
    observations
  );

  if (pathsToAdd.length) {
    feedback.title('Operation Diffs');
    for (let unmatchedPath of pathsToAdd) {
      unmatchedPath.methods.forEach((method) =>
        renderUndocumentedPath(method.toUpperCase(), unmatchedPath.pathPattern)
      );
    }
    feedback.commandInstruction('--add *', 'to document these paths');
    feedback.commandInstruction(
      `--add "[method path], ..."`,
      'to document or more paths'
    );
  }

  function operationId({ path, method }: { path: string; method: string }) {
    return `${method}${path}`;
  }
}

async function trackStats(observations: StatusObservations) {
  const stats = {
    unmatchedPathsCount: 0,
    unmatchedMethodsCount: 0,

    capturedInteractionsCount: 0,
    matchedInteractionsCount: 0,
  };

  await trackCompletion('openapi_cli.status', stats, async function* () {
    for await (let observation of observations) {
      if (observation.kind === StatusObservationKind.InteractionUnmatchedPath) {
        stats.unmatchedPathsCount += 1;
        yield stats;
      } else if (
        observation.kind === StatusObservationKind.InteractionUnmatchedMethod
      ) {
        stats.unmatchedMethodsCount += 1;
        yield stats;
      } else if (
        observation.kind === StatusObservationKind.InteractionCaptured
      ) {
        stats.capturedInteractionsCount += 1;
        yield stats;
      } else if (
        observation.kind === StatusObservationKind.InteractionMatchedOperation
      ) {
        stats.matchedInteractionsCount += 1;
        yield stats;
      }
    }
  });
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

function renderUndocumentedPath(method: string, pathPattern: string) {
  console.log(
    `${chalk.bgYellow('Undocumented')} ${method
      .toUpperCase()
      .padStart(6, ' ')} ${pathPattern}`
  );
}
