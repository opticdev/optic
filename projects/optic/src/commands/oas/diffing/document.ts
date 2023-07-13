import { Err, Ok, Result } from 'ts-results';
import {
  DocumentedInteraction,
  DocumentedInteractions,
  HttpMethod,
  HttpMethods,
  UndocumentedOperation,
  UndocumentedOperations,
  UndocumentedOperationType,
} from '../operations';
import { InferPathStructure } from '../operations/infer-path-structure';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import * as AT from '../lib/async-tools';
import {
  SpecFile,
  SpecFileOperation,
  SpecFileOperations,
  SpecFiles,
  SpecFilesAsync,
  SpecFilesSourcemap,
  SpecPatch,
  SpecPatches,
} from '../specs';
import { DocumentedBodies, DocumentedBody } from '../shapes';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { ApiCoverageCounter } from '../../capture/coverage/api-coverage';
import { SchemaInventory } from '../shapes/closeness/schema-inventory';
import { specToOperations } from '../operations/queries';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';
import {
  CapturedInteraction,
  CapturedInteractions,
} from '../../capture/sources/captured-interactions';

export interface ParsedOperation {
  methods: HttpMethod[];
  pathPattern: string;
}

export function parseAddOperations(
  input: string[]
): Result<ParsedOperation[], string> {
  const components = input.filter((s) => s.length > 0);
  const pairs: ParsedOperation[] = [];

  const regex = /(get|post|put|delete|patch|options|head)( +)(\/.*)/i;

  components.forEach((comp) => {
    const groups = regex.exec(comp);
    if (groups !== null) {
      const method = groups[1];
      const pathPattern = groups[3];

      pairs.push({
        methods: [HttpMethods[method.toUpperCase()]!],
        pathPattern:
          pathPattern.length > 1 && pathPattern.endsWith('/')
            ? pathPattern.substring(0, pathPattern.length - 1)
            : pathPattern,
      });
    }
  });

  if (pairs.length !== input.length) {
    return Err('Invalid format for endpoint documentation');
  }

  return Ok(pairs);
}

export async function addIfUndocumented(
  operationsToAdd: ParsedOperation[],
  isAddAll: boolean,
  statusObservations: StatusObservations,
  interactions: CapturedInteractions,
  spec: OpenAPIV3.Document,
  sourcemap: SpecFilesSourcemap
): Promise<Result<RecentlyDocumented, string>> {
  const operationsToUpdate = isAddAll
    ? await observationToUndocumented(
        statusObservations,
        specToOperations(spec)
      )
    : operationsToAdd;

  let { results: addPatches, observations: addObservations } = addOperations(
    spec,
    operationsToUpdate,
    interactions
  );

  let { results: updatedSpecFiles, observations: fileObservations } =
    updateSpecFiles(addPatches, sourcemap);

  let observations = AT.forkable(AT.merge(addObservations, fileObservations));
  const stats = collectStats(observations.fork());
  observations.start();

  for await (let _ of SpecFiles.writeFiles(updatedSpecFiles)) {
  }
  return Ok(await stats);
}

// observations to diffs

export async function observationToUndocumented(
  observations: StatusObservations,
  operations: { pathPattern: string; methods: string[] }[]
) {
  let pathDiffs = {
    matchedOperations: new Map<string, { path: string; method: string }>(),
    matchedInteractionCountByOperation: new Map<string, number>(),
    unmatchedMethods: new Map<string, { path: string; methods: string[] }>(),
    unmatchedPaths: new Map<string, { path: string; method: string }>(),
  };

  for await (let observation of observations) {
    if (observation.kind === StatusObservationKind.InteractionUnmatchedPath) {
      let opId = operationId(observation);
      const { path, method } = observation;
      pathDiffs.unmatchedPaths.set(opId, { path, method });
    } else if (
      observation.kind === StatusObservationKind.InteractionUnmatchedMethod
    ) {
      let opId = operationId(observation);

      if (!pathDiffs.unmatchedMethods.has(opId)) {
        const { path, method } = observation;
        pathDiffs.unmatchedMethods.set(opId, { path, methods: [method] });
      } else {
        let methods = pathDiffs.unmatchedMethods.get(opId)!.methods;
        methods.push(observation.method);
      }
    }
  }

  const inferredPathStructure = new InferPathStructure(operations);
  [...pathDiffs.unmatchedPaths.values()].forEach((observed) =>
    inferredPathStructure.includeObservedUrlPath(observed.method, observed.path)
  );
  [...pathDiffs.unmatchedMethods.values()].forEach((observed) => {
    observed.methods.forEach((method) => {
      inferredPathStructure.includeObservedUrlPath(method, observed.path);
    });
  });
  inferredPathStructure.replaceConstantsWithVariables();
  const pathsToAdd = inferredPathStructure.undocumentedPaths();

  return pathsToAdd;

  function operationId({ path, method }: { path: string; method: string }) {
    return `${method}${path}`;
  }
}

export function matchInteractions(
  spec: OpenAPIV3.Document,
  interactions: CapturedInteractions,
  coverage: ApiCoverageCounter = new ApiCoverageCounter(spec)
): { observations: StatusObservations; coverage: ApiCoverageCounter } {
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
      if (documentedInteractionOption.none) continue;

      let documentedInteraction = documentedInteractionOption.unwrap();

      coverage.operationInteraction(
        documentedInteraction.operation.pathPattern,
        documentedInteraction.operation.method,
        Boolean(documentedInteraction.interaction.request.body),
        documentedInteraction.interaction.response?.statusCode
      );

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

  return {
    observations: AT.merge(
      captureObservations,
      matchingObservations,
      unmatchingObservations
    ),
    coverage,
  };
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

export function addOperations(
  spec: OpenAPIV3.Document,
  requiredOperations: ParsedOperation[],
  interactions: CapturedInteractions
): { results: SpecPatches; observations: AsyncIterable<AddObservation> } {
  const openAPIVersion = checkOpenAPIVersion(spec);
  const observing = new AT.Subject<AddObservation>();
  const observers = {
    // operations
    requiredOperations(operations: ParsedOperation[]) {
      observing.onNext({
        kind: AddObservationKind.RequiredOperations,
        operations,
      });
    },
    undocumentedOperation(op: UndocumentedOperation) {
      if (op.type === UndocumentedOperationType.MissingPath) {
        observing.onNext({
          kind: AddObservationKind.UnmatchedPath,
          requiredPath: op.pathPattern,
        });
      } else if (op.type === UndocumentedOperationType.MissingMethod) {
        observing.onNext({
          kind: AddObservationKind.UnmatchedMethod,
          matchedPathPattern: op.pathPattern,
          requiredMethod: op.method,
        });
      }
    },
    newOperation(op: { pathPattern: string; method: HttpMethod }) {
      observing.onNext({
        kind: AddObservationKind.NewOperation,
        pathPattern: op.pathPattern,
        method: op.method,
      });
    },

    // interactions

    capturedInteraction(interaction: CapturedInteraction) {
      observing.onNext({
        kind: AddObservationKind.InteractionCaptured,
        path: interaction.request.path,
        method: interaction.request.method,
      });
    },
    documentedInteraction(interaction: DocumentedInteraction) {
      observing.onNext({
        kind: AddObservationKind.InteractionMatchedOperation,
        capturedPath: interaction.interaction.request.path,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,
      });
    },
    documentedInteractionBody(
      interaction: DocumentedInteraction,
      body: DocumentedBody
    ) {
      observing.onNext({
        kind: AddObservationKind.InteractionBodyMatched,
        capturedPath: interaction.interaction.request.path,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,

        decodable: body.body.some,
        capturedContentType: body.bodySource!.contentType,
      });
    },
    interactionPatch(interaction: DocumentedInteraction, patch: SpecPatch) {
      observing.onNext({
        kind: AddObservationKind.InteractionPatchGenerated,
        capturedPath: interaction.interaction.request.path,
        pathPattern: interaction.operation.pathPattern,
        method: interaction.operation.method,
        description: patch.description,
      });
    },
  };

  const specPatches = (async function* (): SpecPatches {
    let patchedSpec = spec;
    let addedOperations: Array<{ pathPattern: string; method: HttpMethod }> =
      [];

    // phase one: documented all undocumented operations
    let updatingSpec: AT.Subject<OpenAPIV3.Document> = new AT.Subject();
    const undocumentedOperations = UndocumentedOperations.fromPairs(
      AT.from(requiredOperations),
      spec,
      updatingSpec.iterator
    );
    for await (let undocumentedOperation of undocumentedOperations) {
      observers.undocumentedOperation(undocumentedOperation);

      let patches = SpecPatches.undocumentedOperation(undocumentedOperation);

      for (let patch of patches) {
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
      }

      if (
        undocumentedOperation.type === UndocumentedOperationType.MissingPath
      ) {
        for (let method of undocumentedOperation.methods) {
          let addedOperation = {
            pathPattern: undocumentedOperation.pathPattern,
            method,
          };
          addedOperations.push(addedOperation);
          observers.newOperation(addedOperation);
        }
      } else if (
        undocumentedOperation.type === UndocumentedOperationType.MissingMethod
      ) {
        let addedOperation = {
          pathPattern: undocumentedOperation.pathPattern,
          method: undocumentedOperation.method,
        };
        addedOperations.push(addedOperation);
        observers.newOperation(addedOperation);
      }

      updatingSpec.onNext(patchedSpec);
    }
    updatingSpec.onCompleted();

    // phase two: patches to document requests, responses and their bodies
    updatingSpec = new AT.Subject(); // new stream of updates for generating of documented interactions
    const documentedInteractions =
      DocumentedInteractions.fromCapturedInteractions(
        AT.tap(observers.capturedInteraction)(interactions),
        patchedSpec,
        updatingSpec.iterator
      );

    for await (let documentedInteractionOption of documentedInteractions) {
      if (documentedInteractionOption.none) continue;

      let documentedInteraction = documentedInteractionOption.unwrap();
      let operation = documentedInteraction.operation;

      if (
        !addedOperations.find(
          ({ pathPattern, method }) =>
            pathPattern === operation.pathPattern && method === operation.method
        )
      ) {
        updatingSpec.onNext(patchedSpec); // nothing changed, still report to keep documented interactions flowing
        continue;
      }

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
        AT.tap((body: DocumentedBody) => {
          observers.documentedInteractionBody(documentedInteraction, body);
        })(documentedBodies),
        openAPIVersion
      );

      const addedPaths = new Set<string>();

      for await (let patch of shapePatches) {
        // register additions
        addedPaths.add(patch.path);
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
        observers.interactionPatch(documentedInteraction, patch);
      }

      const schemaInventory = new SchemaInventory();
      schemaInventory.addSchemas(
        jsonPointerHelpers.compile(['components', 'schemas']),
        patchedSpec.components?.schemas || ({} as any)
      );

      const refRefactors = schemaInventory.refsForAdditions(
        addedPaths,
        patchedSpec
      );

      for await (let patch of refRefactors) {
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

export function updateSpecFiles(
  updatePatches: SpecPatches,
  sourcemap: SpecFilesSourcemap
): {
  results: SpecFilesAsync;
  observations: AddObservations;
} {
  const stats = {
    filesWithOverwrittenYamlComments: new Set<string>(),
  };
  const observing = new AT.Subject<AddObservation>();
  const observers = {
    fileOperation(op: SpecFileOperation) {},
    updatedFile(file: SpecFile) {
      observing.onNext({
        kind: AddObservationKind.SpecFileUpdated,
        path: file.path,
        overwrittenComments: stats.filesWithOverwrittenYamlComments.has(
          file.path
        ),
      });
    },
  };

  const specFiles = [...SpecFiles.fromSourceMap(sourcemap)];

  const fileOperations = AT.tap(observers.fileOperation)(
    SpecFileOperations.fromSpecPatches(updatePatches, sourcemap)
  );

  const updatedSpecFiles = AT.tap(observers.updatedFile)(
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

export enum AddObservationKind {
  UnmatchedPath = 'unmatched-path',
  UnmatchedMethod = 'unmatched-method',
  NewOperation = 'new-operation',
  SpecFileUpdated = 'spec-file-updated',
  RequiredOperations = 'required-operations',

  // with traffic
  // TODO: power these from a generalised CapturedObservations, so it's consistent between commands
  InteractionBodyMatched = 'interaction-body-matched',
  InteractionCaptured = 'interaction-captured',
  InteractionMatchedOperation = 'interaction-matched-operation',
  InteractionPatchGenerated = 'interaction-patch-generated',
}

export type AddObservation = {
  kind: AddObservationKind;
} & (
  | {
      kind: AddObservationKind.UnmatchedPath;
      requiredPath: string;
    }
  | {
      kind: AddObservationKind.UnmatchedMethod;
      matchedPathPattern: string;
      requiredMethod: string;
    }
  | {
      kind: AddObservationKind.NewOperation;
      pathPattern: string;
      method: HttpMethod;
    }
  | {
      kind: AddObservationKind.SpecFileUpdated;
      path: string;
      overwrittenComments: boolean;
    }
  | {
      kind: AddObservationKind.RequiredOperations;
      operations: ParsedOperation[];
    }

  // with traffic:
  // TODO: power these from a generalised CapturedObservations, so it's consistent between commands
  | {
      kind: AddObservationKind.InteractionBodyMatched;
      capturedPath: string;
      pathPattern: string;
      method: string;

      capturedContentType: string | null;
      decodable: boolean;
    }
  | {
      kind: AddObservationKind.InteractionCaptured;
      path: string;
      method: string;
    }
  | {
      kind: AddObservationKind.InteractionMatchedOperation;
      capturedPath: string;
      pathPattern: string;
      method: string;
    }
  | {
      kind: AddObservationKind.InteractionPatchGenerated;
      capturedPath: string;
      pathPattern: string;
      method: string;
      description: string;
    }
);

export interface AddObservations extends AsyncIterable<AddObservation> {}

type RecentlyDocumented = {
  method: string;
  pathPattern: string;
  jsonPointer: string;
}[];

async function collectStats(
  observations: AddObservations
): Promise<RecentlyDocumented> {
  const newOperations: {
    method: string;
    pathPattern: string;
    jsonPointer: string;
  }[] = [];

  for await (let observation of observations) {
    if (observation.kind === AddObservationKind.NewOperation) {
      newOperations.push({
        method: observation.method,
        pathPattern: observation.pathPattern,
        jsonPointer: jsonPointerHelpers.compile([
          'paths',
          observation.pathPattern,
          observation.method,
        ]),
      });
    }
  }

  return newOperations;
}
