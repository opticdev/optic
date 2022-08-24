import { Command } from 'commander';
import Path from 'path';
import * as fs from 'fs-extra';
import readline from 'readline';
import { updateReporter } from './reporters/update';
import { createCommandFeedback, InputErrors } from './reporters/feedback';

import { tap, forkable, merge, Subject } from '../lib/async-tools';
import * as AT from '../lib/async-tools';
import {
  SpecFile,
  SpecFileOperation,
  OpenAPIV3,
  readDeferencedSpec,
} from '../specs';
import {
  SpecFileOperations,
  SpecPatch,
  SpecPatches,
  SpecFiles,
  SpecFilesAsync,
  SpecFilesSourcemap,
} from '../specs';

import { trackCompletion, trackEvent } from '../segment';
import { trackWarning } from '../sentry';
import {
  CapturedInteraction,
  CapturedInteractions,
  HarEntries,
  ProxyInteractions,
} from '../captures';
import { DocumentedInteraction, DocumentedInteractions } from '../operations';
import { AbortController } from 'node-abort-controller';
import { DocumentedBodies, DocumentedBody } from '../shapes';

export async function updateCommand(): Promise<Command> {
  const command = new Command('update');
  const feedback = await createCommandFeedback(command);

  command
    .usage('openapi.yml')
    .argument('<openapi-file>', 'an OpenAPI spec file to update')
    .description('update an OpenAPI specification from observed traffic')
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option(
      '--proxy <target-url>',
      'accept traffic over a proxy targeting the actual service'
    )
    .action(async (specPath) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return await feedback.inputError(
          'OpenAPI specification file could not be found',
          InputErrors.SPEC_FILE_NOT_FOUND
        );
      }

      const options = command.opts();

      let sourcesController = new AbortController();
      const sources: CapturedInteractions[] = [];
      let interactiveCapture = false;

      if (options.har) {
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
      }

      if (options.proxy) {
        if (!process.stdin.isTTY) {
          return await feedback.inputError(
            'can only use --proxy when in an interactive terminal session',
            InputErrors.PROXY_IN_NON_TTY
          );
        }

        let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
          options.proxy,
          sourcesController.signal
        );
        sources.push(
          CapturedInteractions.fromProxyInteractions(proxyInteractions)
        );
        feedback.notable(
          `Proxy created. Redirect traffic you want to capture to ${proxyUrl}`
        );
        interactiveCapture = true;
      }

      if (sources.length < 1) {
        return await feedback.inputError(
          'choose a capture method to update spec by traffic',
          InputErrors.CAPTURE_METHOD_MISSING
        );
      }

      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        await feedback.inputError(
          `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`,
          InputErrors.SPEC_FILE_NOT_READABLE
        );
      }
      const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

      let interactions = merge(...sources);

      let { results: updatePatches, observations: updateObservations } =
        updateByInteractions(spec, interactions);

      let { results: updatedSpecFiles, observations: fileObservations } =
        updateSpecFiles(updatePatches, sourcemap);

      const handleUserSignals = (async function () {
        if (interactiveCapture && process.stdin.isTTY) {
          // wait for an empty new line on input, which should indicate hitting Enter / Return
          let lines = readline.createInterface({ input: process.stdin });
          for await (let line of lines) {
            if (line.trim().length === 0) {
              lines.close();
              readline.moveCursor(process.stdin, 0, -1);
              readline.clearLine(process.stdin, 1);
              sourcesController.abort();
            }
          }
        }
      })();

      const writingSpecFiles = (async function () {
        for await (let writtenFilePath of SpecFiles.writeFiles(
          updatedSpecFiles
        )) {
          // console.log(`Updated ${writtenFilePath}`);
        }
      })();

      let observations = forkable(merge(updateObservations, fileObservations));
      const renderingStats = renderUpdateStats(observations.fork());
      const trackingStats = trackStats(observations.fork());
      observations.start();

      await Promise.all([
        handleUserSignals,
        writingSpecFiles,
        renderingStats,
        trackingStats,
      ]);
    });

  return command;
}

export function updateByInteractions(
  spec: OpenAPIV3.Document,
  interactions: CapturedInteractions
): { results: SpecPatches; observations: UpdateObservations } {
  const updatingSpec = new Subject<OpenAPIV3.Document>();
  const specUpdates = updatingSpec.iterator;

  const observing = new Subject<UpdateObservation>();
  const observers = {
    capturedInteraction(interaction: CapturedInteraction) {
      observing.onNext({
        kind: UpdateObservationKind.InteractionCaptured,
        path: interaction.request.path,
        method: interaction.request.method,
      });
    },
    documentedInteractionBody(
      interaction: DocumentedInteraction,
      body: DocumentedBody
    ) {
      observing.onNext({
        kind: UpdateObservationKind.InteractionBodyMatched,
        capturedPath: interaction.interaction.request.path,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,

        decodable: body.body.some,
        capturedContentType: body.bodySource!.contentType,
      });
    },
    documentedInteraction(interaction: DocumentedInteraction) {
      observing.onNext({
        kind: UpdateObservationKind.InteractionMatchedOperation,
        capturedPath: interaction.interaction.request.path,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,
      });
    },
    interactionPatch(interaction: DocumentedInteraction, patch: SpecPatch) {
      observing.onNext({
        kind: UpdateObservationKind.InteractionPatchGenerated,
        capturedPath: interaction.interaction.request.path,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,
        description: patch.description,
      });
    },
  };

  const documentedInteractions =
    DocumentedInteractions.fromCapturedInteractions(
      tap(observers.capturedInteraction)(interactions),
      spec,
      specUpdates
    );

  const specPatches = (async function* (): SpecPatches {
    let patchedSpec = spec;
    for await (let documentedInteractionOption of documentedInteractions) {
      if (documentedInteractionOption.none) continue;

      let documentedInteraction = documentedInteractionOption.unwrap();

      observers.documentedInteraction(documentedInteraction);

      // phase one: operation patches, making sure all requests / responses are documented
      let opPatches = SpecPatches.operationAdditions(documentedInteraction);

      for await (let patch of opPatches) {
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
        observers.interactionPatch(documentedInteraction, patch);
      }

      // phase two: shape patches, describing request / response bodies in detail
      documentedInteraction = DocumentedInteraction.updateOperation(
        documentedInteraction,
        patchedSpec
      );
      let documentedBodies = DocumentedBodies.fromDocumentedInteraction(
        documentedInteraction
      );
      let shapePatches = SpecPatches.shapeAdditions(
        tap((body: DocumentedBody) => {
          observers.documentedInteractionBody(documentedInteraction, body);
        })(documentedBodies)
      );

      for await (let patch of shapePatches) {
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
        observers.interactionPatch(documentedInteraction, patch);
      }

      updatingSpec.onNext(patchedSpec);
    }

    updatingSpec.onCompleted();
  })();

  // additions only, so we only safely extend the spec
  const specAdditions = SpecPatches.additions(specPatches);

  // making sure we end observations once we're done generating patches
  const observedResults = (async function* (): SpecPatches {
    yield* specAdditions;
    observing.onCompleted();
  })();

  return { results: observedResults, observations: observing.iterator };
}

function updateSpecFiles(
  updatePatches: SpecPatches,
  sourcemap: SpecFilesSourcemap
): {
  results: SpecFilesAsync;
  observations: UpdateObservations;
} {
  const stats = {
    filesWithOverwrittenYamlComments: new Set<string>(),
  };
  const observing = new Subject<UpdateObservation>();
  const observers = {
    fileOperation(op: SpecFileOperation) {
      const file = specFiles.find(({ path }) => path === op.filePath);
      if (file && SpecFile.containsYamlComments(file))
        stats.filesWithOverwrittenYamlComments.add(file.path);
    },
    updatedFile(file: SpecFile) {
      observing.onNext({
        kind: UpdateObservationKind.SpecFileUpdated,
        path: file.path,
        overwrittenComments: stats.filesWithOverwrittenYamlComments.has(
          file.path
        ),
      });
    },
  };

  const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

  const fileOperations = tap(observers.fileOperation)(
    SpecFileOperations.fromSpecPatches(updatePatches, sourcemap)
  );

  const updatedSpecFiles = tap(observers.updatedFile)(
    SpecFiles.patch(specFiles, fileOperations)
  );

  // making sure we end observations once we're done generating patches
  const observedResults = (async function* (): SpecFilesAsync {
    yield* updatedSpecFiles;
    observing.onCompleted();
  })();

  return {
    results: observedResults,
    observations: observing.iterator,
  };
}

export enum UpdateObservationKind {
  InteractionBodyMatched = 'interaction-body-matched',
  InteractionCaptured = 'interaction-captured',
  InteractionMatchedOperation = 'interaction-matched-operation',
  InteractionPatchGenerated = 'interaction-patch-generated',
  SpecFileUpdated = 'spec-file-updated',
}

export type UpdateObservation = {
  kind: UpdateObservationKind;
} & (
  | {
      kind: UpdateObservationKind.InteractionBodyMatched;
      capturedPath: string;
      pathPattern: string;
      method: string;

      capturedContentType: string | null;
      decodable: boolean;
    }
  | {
      kind: UpdateObservationKind.InteractionMatchedOperation;
      capturedPath: string;
      pathPattern: string;
      method: string;
    }
  | {
      kind: UpdateObservationKind.InteractionPatchGenerated;
      capturedPath: string;
      pathPattern: string;
      method: string;
      description: string;
    }
  | {
      kind: UpdateObservationKind.InteractionCaptured;
      path: string;
      method: string;
    }
  | {
      kind: UpdateObservationKind.SpecFileUpdated;
      path: string;
      overwrittenComments: boolean;
    }
);

export interface UpdateObservations extends AsyncIterable<UpdateObservation> {}

async function renderUpdateStats(updateObservations: UpdateObservations) {
  const reporter = await updateReporter(process.stderr, process.cwd());

  for await (let observation of updateObservations) {
    if (observation.kind === UpdateObservationKind.InteractionCaptured) {
      let { path, method } = observation;
      reporter.capturedInteraction({ path, method });
    } else if (
      observation.kind === UpdateObservationKind.InteractionMatchedOperation
    ) {
      let { method, pathPattern } = observation;
      reporter.matchedInteraction({ method, pathPattern });
    } else if (
      observation.kind === UpdateObservationKind.InteractionPatchGenerated
    ) {
      let { method, pathPattern, capturedPath, description } = observation;
      reporter.patch({ method, pathPattern }, capturedPath, description);
    } else if (observation.kind === UpdateObservationKind.SpecFileUpdated) {
      let { path } = observation;
      reporter.fileUpdated(path);
    }
  }

  reporter.finish();
}

async function trackStats(observations: UpdateObservations): Promise<void> {
  const stats = {
    capturedInteractionsCount: 0,
    matchedInteractionsCount: 0,
    filesWithOverwrittenYamlCommentsCount: 0,
    patchesCount: 0,
    updatedFilesCount: 0,
    unsupportedContentTypeCounts: {},
  };

  function eventProperties() {
    return {
      ...stats,
      unsupportedContentTypes: [
        ...Object.keys(stats.unsupportedContentTypeCounts),
      ], // set cast as array
    };
  }

  await trackCompletion(
    'openapi_cli.update',
    eventProperties(),
    async function* () {
      for await (let observation of observations) {
        if (observation.kind === UpdateObservationKind.InteractionCaptured) {
          stats.capturedInteractionsCount += 1;
        } else if (
          observation.kind === UpdateObservationKind.InteractionMatchedOperation
        ) {
          stats.matchedInteractionsCount += 1;
        } else if (
          observation.kind === UpdateObservationKind.InteractionPatchGenerated
        ) {
          stats.patchesCount += 1;
        } else if (observation.kind === UpdateObservationKind.SpecFileUpdated) {
          stats.updatedFilesCount += 1;
          if (observation.overwrittenComments) {
            stats.filesWithOverwrittenYamlCommentsCount += 1;
          }
        } else if (
          observation.kind === UpdateObservationKind.InteractionBodyMatched
        ) {
          if (!observation.decodable && observation.capturedContentType) {
            let count =
              stats.unsupportedContentTypeCounts[
                observation.capturedContentType
              ] || 0;
            stats.unsupportedContentTypeCounts[
              observation.capturedContentType
            ] = count + 1;
          }
        }

        yield eventProperties();
      }

      trackEvent('openapi_cli.spec_updated_by_traffic', eventProperties()); // for legacy reports
    }
  );
}
