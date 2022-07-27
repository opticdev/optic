import { Command } from 'commander';
import { Result, Ok, Err } from 'ts-results';
import Path from 'path';
import * as fs from 'fs-extra';
import { AbortController } from 'node-abort-controller';

import { createCommandFeedback } from './reporters/feedback';
import * as AT from '../lib/async-tools';
import {
  CapturedInteractions,
  HarEntries,
  ProxyInteractions,
} from '../captures';
import {
  DocumentedInteractions,
  DocumentedInteraction,
  HttpMethods,
  HttpMethod,
  UndocumentedOperation,
  UndocumentedOperationType,
  UndocumentedOperations,
} from '../operations';
import { DocumentedBodies } from '../shapes';
import {
  OpenAPIV3,
  SpecFile,
  SpecFileOperation,
  SpecFileOperations,
  SpecFiles,
  SpecFilesAsync,
  SpecFilesSourcemap,
  SpecPatch,
  SpecPatches,
  readDeferencedSpec,
} from '../specs';

export async function addCommand(): Promise<Command> {
  const command = new Command('add');
  const feedback = createCommandFeedback(command);

  command
    .argument('<openapi-file>', 'an OpenAPI spec file to add an operation to')
    .argument('<operations...>', 'HTTP method and path pair(s) to add')
    .description(
      'add an operation (path + method) to an OpenAPI specification. Provide a traffic source to learn request and response bodies as well.'
    )
    .option('--har <har-file>', 'path to HttpArchive file (v1.2, v1.3)')
    .option(
      '--proxy <target-url>',
      'accept traffic over a proxy targeting the actual service'
    )
    .action(async (specPath: string, operationComponents: string[]) => {
      const absoluteSpecPath = Path.resolve(specPath);
      if (!(await fs.pathExists(absoluteSpecPath))) {
        return command.error('OpenAPI specification file could not be found');
      }

      let parsedOperationsResult = parseOperations(operationComponents);
      if (parsedOperationsResult.err) {
        return command.error(parsedOperationsResult.val);
      }

      let parsedOperations = parsedOperationsResult.unwrap();

      let sourcesController = new AbortController();
      const sources: CapturedInteractions[] = [];
      let interactiveCapture = false;

      const options = command.opts();
      if (options.har) {
        let absoluteHarPath = Path.resolve(options.har);
        if (!(await fs.pathExists(absoluteHarPath))) {
          return command.error('Har file could not be found at given path');
        }
        let harFile = fs.createReadStream(absoluteHarPath);
        let harEntries = HarEntries.fromReadable(harFile);
        sources.push(CapturedInteractions.fromHarEntries(harEntries));
      }

      if (options.proxy) {
        if (!process.stdin.isTTY) {
          return command.error(
            'Can only use --proxy when in an interactive terminal session'
          );
        }

        let [proxyInteractions, proxyUrl] = await ProxyInteractions.create(
          options.proxy,
          sourcesController.signal
        );
        sources.push(
          CapturedInteractions.fromProxyInteractions(proxyInteractions)
        );
        console.log(
          `Proxy created. Redirect traffic you want to capture to ${proxyUrl}`
        );
        interactiveCapture = true;
      }

      let interactions =
        sources.length > 0 ? AT.merge(...sources) : AT.from([]);

      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        command.error(
          `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`
        );
      }
      const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

      let { results: addPatches, observations: addObservations } =
        addOperations(spec, parsedOperations, interactions);

      let { results: updatedSpecFiles, observations: fileObservations } =
        updateSpecFiles(addPatches, sourcemap);

      const writingSpecFiles = (async function () {
        for await (let writtenFilePath of SpecFiles.writeFiles(
          updatedSpecFiles
        )) {
          // console.log(`Updated ${writtenFilePath}`);
        }
      })();

      let observations = AT.forkable(
        AT.merge(addObservations, fileObservations)
      );
      const renderingStats = renderAddProgress(observations.fork());
      observations.start();

      await Promise.all([writingSpecFiles, renderingStats]);
    });

  return command;
}

interface ParsedOperation {
  methods: Array<HttpMethod>;
  pathPattern: string;
}

export function addOperations(
  spec: OpenAPIV3.Document,
  requiredOperations: ParsedOperation[],
  interactions: CapturedInteractions
): { results: SpecPatches; observations: AsyncIterable<AddObservation> } {
  const observing = new AT.Subject<AddObservation>();
  const observers = {
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
    newOperationPatch(patch: SpecPatch) {
      observing.onNext({
        kind: AddObservationKind.NewOperationPatch,
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
        observers.newOperationPatch(patch);
      }

      if (
        undocumentedOperation.type === UndocumentedOperationType.MissingPath
      ) {
        for (let method of undocumentedOperation.methods) {
          addedOperations.push({
            pathPattern: undocumentedOperation.pathPattern,
            method,
          });
        }
      } else if (
        undocumentedOperation.type === UndocumentedOperationType.MissingMethod
      ) {
        addedOperations.push({
          pathPattern: undocumentedOperation.pathPattern,
          method: undocumentedOperation.method,
        });
      }

      updatingSpec.onNext(patchedSpec);
    }
    updatingSpec.onCompleted();

    // phase two: patches to document requests, responses and their bodies
    updatingSpec = new AT.Subject(); // new stream of updates for generating of documented interactions
    const documentedInteractions =
      DocumentedInteractions.fromCapturedInteractions(
        interactions,
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

      // phase one: operation patches, making sure all requests / responses are documented
      let opPatches = SpecPatches.operationAdditions(documentedInteraction);

      for await (let patch of opPatches) {
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
      }

      // phase two: shape patches, describing request / response bodies in detail
      documentedInteraction = DocumentedInteraction.updateOperation(
        documentedInteraction,
        patchedSpec
      );
      let documentedBodies = DocumentedBodies.fromDocumentedInteraction(
        documentedInteraction
      );
      let shapePatches = SpecPatches.shapeAdditions(documentedBodies);

      for await (let patch of shapePatches) {
        patchedSpec = SpecPatch.applyPatch(patch, patchedSpec);
        yield patch;
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
  observations: AddObservations;
} {
  const stats = {
    filesWithOverwrittenYamlComments: new Set<string>(),
  };
  const observing = new AT.Subject<AddObservation>();
  const observers = {
    fileOperation(op: SpecFileOperation) {
      const file = specFiles.find(({ path }) => path === op.filePath);
      if (file && SpecFile.containsYamlComments(file))
        stats.filesWithOverwrittenYamlComments.add(file.path);
    },
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
  NewOperationPatch = 'new-operation-patch',
  SpecFileUpdated = 'spec-file-updated',
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
      kind: AddObservationKind.NewOperationPatch;
      description: string;
    }
  | {
      kind: AddObservationKind.SpecFileUpdated;
      path: string;
      overwrittenComments: boolean;
    }
);

export interface AddObservations extends AsyncIterable<AddObservation> {}

function parseOperations(
  rawComponents: string[]
): Result<ParsedOperation[], string> {
  const components = rawComponents.filter((s) => s.length > 0);
  const pairs: ParsedOperation[] = [];

  for (let i = 0; i < Math.ceil(components.length / 2); i++) {
    let rawMethods = components[i * 2];
    let pathPattern = components[i * 2 + 1];

    let methods: Array<HttpMethod> = [];
    for (let maybeMethod of rawMethods.split(',')) {
      let method = HttpMethods[maybeMethod.toUpperCase()];
      if (!method) {
        return Err(`Could not parse '${maybeMethod}' as a valid HTTP method`);
      }
      methods.push(method as HttpMethod);
    }

    let pair = { methods, pathPattern };
    pairs.push(pair);
  }

  return Ok(pairs);
}

async function renderAddProgress(observations: AddObservations) {
  let patchCount = 0;

  for await (let observation of observations) {
    if (observation.kind === AddObservationKind.UnmatchedPath) {
      console.log(`Undocumented path: ${observation.requiredPath}`);
    } else if (observation.kind === AddObservationKind.UnmatchedMethod) {
      console.log(
        `Undocumented method: ${observation.requiredMethod.toUpperCase()} for existing path ${
          observation.matchedPathPattern
        }`
      );
    } else if (observation.kind === AddObservationKind.NewOperationPatch) {
      patchCount += 1;
      console.log(`PATCH: ${observation.description}`);
    } else if (observation.kind === AddObservationKind.SpecFileUpdated) {
      let { path } = observation;
      // console.log('Spec file update queued', path);
    }
  }

  if (patchCount === 0) {
    console.log('All requested operations were already present in spec');
  }
}
