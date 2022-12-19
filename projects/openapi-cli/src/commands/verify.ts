import { Command } from 'commander';
import Path from 'path';
import path from 'path';
import * as fs from 'fs-extra';

import { createCommandFeedback, InputErrors } from './reporters/feedback';
import { trackCompletion } from '../segment';
import { trackWarning } from '../sentry';
import * as AT from '../lib/async-tools';
import { readDeferencedSpec } from '../specs';
import {
  DocumentedInteractions,
  UndocumentedOperations,
  UndocumentedOperationType,
} from '../operations';
import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
} from '../captures';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { captureStorage } from '../captures/capture-storage';
import chalk from 'chalk';
import { InferPathStructure } from '../operations/infer-path-structure';
import { updateByInteractions } from './update';

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
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return await feedback.inputError(
          'OpenAPI specification file could not be found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }

      const options = command.opts();

      const sources: CapturedInteractions[] = [];

      const [, captureStorageDirectory] = await captureStorage(specPath);

      const captureDirectoryContents = (
        await fs.readdir(captureStorageDirectory)
      ).sort();

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

      /// Add if --add options passed

      /// Update if --update options passed in

      /// Run the verify with the latest specification
      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        await feedback.inputError(
          `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`,
          InputErrors.SPEC_FILE_NOT_READABLE
        );
      }
      const { jsonLike: spec } = specReadResult.unwrap();

      let interactions = AT.merge(...sources);

      let observations = matchInteractions(spec, interactions);

      let observationsFork = AT.forkable(observations);

      const renderingStatus = renderOperationStatus(
        observationsFork.fork(),
        feedback,
        {
          addUsage,
        }
      );

      // let { results: updatePatches, observations: updateObservations } =
      //   updateByInteractions(spec, interactions);

      // console.log(updateObservations, updatePatches);

      const trackingStats = trackStats(observationsFork.fork());
      observationsFork.start();

      await Promise.all([renderingStatus, trackingStats]);
    });

  return command;
}

export function matchInteractions(
  spec: OpenAPIV3.Document,
  interactions: CapturedInteractions
): StatusObservations {
  const interactionsFork = AT.forkable(
    // TODO: figure out why this prevents `forkable` from producing an empty object as the last interaction
    AT.tap<CapturedInteraction>(() => {})(interactions)
  );

  const documentedInteractions =
    DocumentedInteractions.fromCapturedInteractions(
      interactionsFork.fork(),
      spec
    );
  const undocumentedOperations =
    UndocumentedOperations.fromCapturedInteractions(
      interactionsFork.fork(),
      spec
    );
  const capturedInteractions = interactionsFork.fork();
  interactionsFork.start();

  const matchingObservations = (async function* (): StatusObservations {
    for await (let documentedInteractionOption of documentedInteractions) {
      console.log;
      if (documentedInteractionOption.none) continue;

      let documentedInteraction = documentedInteractionOption.unwrap();

      yield {
        kind: StatusObservationKind.InteractionMatchedOperation,
        capturedPath: documentedInteraction.interaction.request.path,
        path: documentedInteraction.operation.pathPattern,
        method: documentedInteraction.operation.method,
      };
    }
  })();

  const unmatchingObservations = (async function* (): StatusObservations {
    for await (let undocumentedOperation of undocumentedOperations) {
      if (
        undocumentedOperation.type === UndocumentedOperationType.MissingMethod
      ) {
        yield {
          kind: StatusObservationKind.InteractionUnmatchedMethod,
          path: undocumentedOperation.pathPattern,
          method: undocumentedOperation.method,
        };
      } else if (
        undocumentedOperation.type === UndocumentedOperationType.MissingPath
      ) {
        for (let method of undocumentedOperation.methods) {
          yield {
            kind: StatusObservationKind.InteractionUnmatchedPath,
            path: undocumentedOperation.pathPattern,
            method,
          };
        }
      }
    }
  })();

  const captureObservations = AT.map(function (
    interaction: CapturedInteraction
  ): StatusObservation {
    return {
      kind: StatusObservationKind.InteractionCaptured,
      path: interaction.request.path,
      method: interaction.request.method,
    };
  })(capturedInteractions);

  return AT.merge(
    captureObservations,
    matchingObservations,
    unmatchingObservations
  );
}

export enum StatusObservationKind {
  InteractionCaptured = 'interaction-captured',
  InteractionMatchedOperation = 'interaction-matched-operation',
  InteractionUnmatchedMethod = 'interaction-unmatched-method',
  InteractionUnmatchedPath = 'interaction-unmatched-path',
}

export type StatusObservation = {
  kind: StatusObservationKind;
} & (
  | {
      kind: StatusObservationKind.InteractionCaptured;
      path: string;
      method: string;
    }
  | {
      kind: StatusObservationKind.InteractionMatchedOperation;
      capturedPath: string;
      path: string;
      method: string;
    }
  | {
      kind: StatusObservationKind.InteractionUnmatchedMethod;
      path: string;
      method: string;
    }
  | {
      kind: StatusObservationKind.InteractionUnmatchedPath;
      path: string;
      method: string;
    }
);

export interface StatusObservations extends AsyncIterable<StatusObservation> {}

async function renderOperationStatus(
  observations: StatusObservations,
  feedback: Awaited<ReturnType<typeof createCommandFeedback>>,
  { addUsage }: { addUsage: string }
) {
  let stats = {
    interationsCount: 0,
    matchedOperations: new Map<string, { path: string; method: string }>(),
    matchedInteractionCountByOperation: new Map<string, number>(),
    unmatchedMethods: new Map<string, { path: string; methods: string[] }>(),
    unmatchedPaths: new Map<string, { path: string; method: string }>(),
  };

  for await (let observation of observations) {
    if (
      observation.kind === StatusObservationKind.InteractionMatchedOperation
    ) {
      stats.interationsCount += 1;
      let opId = operationId(observation);

      if (!stats.matchedOperations.has(opId)) {
        let { path, method } = observation;
        stats.matchedOperations.set(opId, { path, method });
        stats.matchedInteractionCountByOperation.set(opId, 1);
      } else {
        let interactionCount =
          stats.matchedInteractionCountByOperation.get(opId)! + 1;
        stats.matchedInteractionCountByOperation.set(opId, interactionCount);
      }
    } else if (
      observation.kind === StatusObservationKind.InteractionUnmatchedPath
    ) {
      stats.interationsCount += 1;
      let opId = operationId(observation);

      if (!stats.unmatchedPaths.has(opId)) {
        const { path, method } = observation;
        stats.unmatchedPaths.set(opId, { path, method });
      }
    } else if (
      observation.kind === StatusObservationKind.InteractionUnmatchedMethod
    ) {
      stats.interationsCount += 1;
      let opId = operationId(observation);

      if (!stats.unmatchedMethods.has(opId)) {
        const { path, method } = observation;
        stats.unmatchedMethods.set(opId, { path, methods: [method] });
      } else {
        let methods = stats.unmatchedMethods.get(opId)!.methods;
        methods.push(observation.method);
      }
    }
  }

  const inferredPathStructure = new InferPathStructure([]);
  [...stats.unmatchedPaths.values()].forEach((observed) =>
    inferredPathStructure.includeObservedUrlPath(observed.method, observed.path)
  );
  inferredPathStructure.replaceConstantsWithVariables();
  const pathsToAdd = inferredPathStructure.undocumentedPaths();

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

function renderUndocumentedPath(method: string, pathPattern: string) {
  console.log(
    `${chalk.bgYellow('Undocumented')} ${method
      .toUpperCase()
      .padStart(6, ' ')} ${pathPattern}`
  );
}
