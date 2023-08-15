import {
  SpecFile,
  SpecFileOperation,
  SpecFileOperations,
  SpecFiles,
  SpecFilesAsync,
  SpecFilesSourcemap,
} from '../specs';
import {
  checkOpenAPIVersion,
  jsonPointerLogger,
  JsonSchemaSourcemap,
} from '@useoptic/openapi-io';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import chalk from 'chalk';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { Subject, tap } from '../lib/async-tools';
import { DocumentedInteraction, DocumentedInteractions } from '../operations';
import {
  DocumentedBodies,
  DocumentedBody,
} from '../../capture/patches/patchers/shapes/documented-bodies';
import { updateReporter } from '../reporters/update';
import { ApiCoverageCounter } from '../../capture/coverage/api-coverage';
import { ParsedOperation } from './document';
import { nextCommand } from '../reporters/next-command';
import {
  CapturedInteraction,
  CapturedInteractions,
} from '../../capture/sources/captured-interactions';
import { ShapeDiffResult } from '../../capture/patches/patchers/shapes/diff';
import {
  SpecPatch,
  SpecPatches,
} from '../../capture/patches/patchers/spec/patches';
import { LegacySpecPatches } from '../specs/streams/patches';

export async function patchOperationsAsNeeded(
  patchInteractions: CapturedInteractions,
  spec: OpenAPIV3.Document,
  sourcemap: JsonSchemaSourcemap,
  isAddAll: boolean = true,
  filterToOperations: ParsedOperation[] = []
) {
  let { results: updatePatches, observations: updateObservations } =
    updateByInteractions(spec, patchInteractions, isAddAll, filterToOperations);

  let { results: updatedSpecFiles, observations: fileObservations } =
    updateSpecFiles(updatePatches, sourcemap);

  const stats = renderUpdateStats(updateObservations);

  const writingSpecFiles = (async function () {
    for await (let writtenFilePath of SpecFiles.writeFiles(updatedSpecFiles)) {
      // console.log(`Updated ${writtenFilePath}`);
    }
  })();

  await Promise.all([writingSpecFiles, stats]);

  return await stats;
}

export async function renderDiffs(
  specPath: string,
  sourcemap: JsonSchemaSourcemap,
  spec: OpenAPIV3.Document,
  patches: SpecPatches,
  coverage: ApiCoverageCounter
) {
  const logger = jsonPointerLogger(sourcemap);

  let stats = {
    totalDiffCount: 0,
    undocumentedBody: 0,
    shapeDiff: 0,
  };

  for await (const patch of patches) {
    const { diff, path, description, groupedOperations } = patch;

    const [_, pathPattern, method] = jsonPointerHelpers.decode(path);

    if (!diff || groupedOperations.length === 0) continue;
    coverage.shapeDiff(patch);

    stats.totalDiffCount++;

    if (
      diff.kind === 'UnmatchdResponseBody' ||
      diff.kind === 'UnmatchedRequestBody' ||
      diff.kind === 'UnmatchedResponseStatusCode'
    ) {
      stats.undocumentedBody++;

      const description =
        diff.kind === 'UnmatchedResponseStatusCode'
          ? `${diff.statusCode} Response ${diff.contentType}`
          : diff.kind === 'UnmatchedRequestBody'
          ? `${diff.contentType} Request body`
          : diff.kind === 'UnmatchdResponseBody'
          ? `${diff.statusCode} Response ${diff.contentType}`
          : '';

      renderBodyDiff(specPath, description, method, pathPattern);
    } else if (diff.kind === 'AdditionalProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.parentObjectPath)
        ).match
      )
        continue;

      stats.shapeDiff++;
      renderShapeDiff(
        specPath,
        diff,
        jsonPointerHelpers.join(path, diff.parentObjectPath),
        `Undocumented '${diff.key}'`,
        logger,
        method,
        pathPattern
      );
    } else if (diff.kind === 'UnmatchedType') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        continue;

      stats.shapeDiff++;
      renderShapeDiff(
        specPath,
        diff,
        jsonPointerHelpers.join(path, diff.propertyPath),
        `[Actual] ${JSON.stringify(diff.example)}`,
        logger,
        method,
        pathPattern
      );
    } else if (diff.kind === 'MissingRequiredProperty') {
      // filter out dependent diffs
      if (
        !jsonPointerHelpers.tryGet(
          spec,
          jsonPointerHelpers.join(path, diff.propertyPath)
        ).match
      )
        continue;

      stats.shapeDiff++;
      renderShapeDiff(
        specPath,
        diff,
        jsonPointerHelpers.join(path, diff.propertyPath),
        `missing`,
        logger,
        method,
        pathPattern
      );
    } else {
      console.log('Unrecognized diff type ' + diff.kind);
    }
  }

  return stats;
}

function renderShapeDiff(
  specPath: string,
  diff: ShapeDiffResult,
  pathToHighlight: string,
  error: string,
  logger: any,
  method: string,
  pathPattern: string
) {
  const lines = `${chalk.bgRed('  Diff  ')} ${diff.description}
operation: ${chalk.bold(`${method} ${pathPattern}`)}  
${logger.log(pathToHighlight, {
  highlightColor: 'yellow',
  observation: error,
})}
${nextCommand(
  `fix schema by running`,
  `optic update ${specPath} "${method} ${pathPattern}"`
)}\n`;
  console.log(lines);
}

function renderBodyDiff(
  specPath: string,
  description: string,
  method: string,
  pathPattern: string
) {
  const lines = `${chalk.bgYellow('  Undocumented  ')} ${description}
  operation: ${chalk.bold(`${method} ${pathPattern}`)}  
${nextCommand(
  `document new body by running`,
  `optic update ${specPath} "${method} ${pathPattern}"`
)}\n`;
  console.log(lines);
}

export function updateByInteractions(
  spec: OpenAPIV3.Document,
  interactions: CapturedInteractions,
  isAddAll: boolean = true,
  filterToOperations: ParsedOperation[] = []
): { results: SpecPatches; observations: UpdateObservations } {
  const openAPIVersion = checkOpenAPIVersion(spec);
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
      specUpdates,
      isAddAll,
      filterToOperations
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
        })(documentedBodies),
        openAPIVersion
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
  const specAdditions = LegacySpecPatches.additions(specPatches);

  // making sure we end observations once we're done generating patches
  const observedResults = (async function* (): SpecPatches {
    yield* specAdditions;
    observing.onCompleted();
  })();

  return { results: observedResults, observations: observing.iterator };
}

export function updateSpecFiles(
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
    fileOperation(op: SpecFileOperation) {},
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

export async function renderUpdateStats(
  updateObservations: UpdateObservations
): Promise<{ interactions: number; patched: number; fileUpdates: number }> {
  console.log(chalk.blueBright('» ') + 'Updating operations...');
  const reporter = await updateReporter(process.stderr, process.cwd());

  let interactions = 0,
    patched = 0,
    fileUpdates = 0;

  for await (let observation of updateObservations) {
    if (observation.kind === UpdateObservationKind.InteractionCaptured) {
      let { path, method } = observation;
      reporter.capturedInteraction({ path, method });
    } else if (
      observation.kind === UpdateObservationKind.InteractionMatchedOperation
    ) {
      interactions++;
      let { method, pathPattern } = observation;
      reporter.matchedInteraction({ method, pathPattern });
    } else if (
      observation.kind === UpdateObservationKind.InteractionPatchGenerated
    ) {
      patched++;

      let { method, pathPattern, capturedPath, description } = observation;
      reporter.patch({ method, pathPattern }, capturedPath, description);
    } else if (observation.kind === UpdateObservationKind.SpecFileUpdated) {
      fileUpdates++;
      let { path } = observation;
      reporter.fileUpdated(path);
    }
  }

  reporter.finish();

  return { interactions, patched, fileUpdates };
}
