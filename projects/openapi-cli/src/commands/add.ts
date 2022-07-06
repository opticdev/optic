import { Command } from 'commander';
import { Result, Ok, Err } from 'ts-results';
import Path from 'path';
import * as fs from 'fs-extra';

import * as AT from '../lib/async-tools';
import { HttpMethods, HttpMethod, UndocumentedOperations } from '../operations';
import {
  OpenAPIV3,
  SpecFile,
  SpecFileOperation,
  SpecFileOperations,
  SpecFiles,
  SpecFilesAsync,
  SpecFilesSourcemap,
  SpecPatches,
  readDeferencedSpec,
} from '../specs';

export function addCommand(): Command {
  const command = new Command('add');

  command
    .argument('<openapi-file>', 'an OpenAPI spec file to add an operation to')
    .argument('<operations...>', 'HTTP method and path pair(s) to add')
    .description('add an operation (path + method) to an OpenAPI specification')
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

      const specReadResult = await readDeferencedSpec(absoluteSpecPath);
      if (specReadResult.err) {
        command.error(
          `OpenAPI specification could not be fully resolved: ${specReadResult.val.message}`
        );
      }
      const { jsonLike: spec, sourcemap } = specReadResult.unwrap();

      let addResult = await addOperations(spec, parsedOperations);
      if (addResult.err) {
        return command.error(addResult.val);
      }

      let { results: addPatches, observations: updateObservations } =
        addResult.unwrap();

      let { results: updatedSpecFiles, observations: fileObservations } =
        updateSpecFiles(addPatches, sourcemap);

      const writingSpecFiles = (async function () {
        for await (let writtenFilePath of SpecFiles.writeFiles(
          updatedSpecFiles
        )) {
          // console.log(`Updated ${writtenFilePath}`);
        }
      })();

      await writingSpecFiles;
    });

  return command;
}

interface ParsedOperation {
  methods: Array<HttpMethod>;
  pathPattern: string;
}

async function addOperations(
  spec: OpenAPIV3.Document,
  requiredOperations: ParsedOperation[]
): Promise<
  Result<
    { results: SpecPatches; observations: AsyncIterable<AddObservation> },
    string
  >
> {
  const updatingSpec = new AT.Subject<OpenAPIV3.Document>();
  const specUpdates = updatingSpec.iterator;

  const observing = new AT.Subject<AddObservation>();

  const undocumentedOperations = UndocumentedOperations.fromPairs(
    AT.from(requiredOperations),
    spec,
    specUpdates
  );

  const specPatches = (async function* (): SpecPatches {
    let patchedSpec = spec;
    for await (let undocumentedOperation of undocumentedOperations) {
      console.log(undocumentedOperation);

      // TODO: generate patches

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

  return Ok({ results: observedResults, observations: observing.iterator });
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
  MatchedPath = 'matched-path',
  MatchedOperation = 'matched-operation',
  OperationPatchGenerated = 'operation-patch-generated',
  SpecFileUpdated = 'spec-file-updated',
}

export type AddObservation = {
  kind: AddObservationKind;
} & {
  kind: AddObservationKind.SpecFileUpdated;
  path: string;
  overwrittenComments: boolean;
};

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
