import {
  SpecFile,
  SpecPatches,
  SpecFileOperation,
  SpecFilesSourcemap,
} from '..';
import { Operation } from '../patches';
import { sourcemapReader } from '@useoptic/openapi-utilities';
import invariant from 'ts-invariant';
import fs from 'fs-extra';

export interface SpecFileOperations extends AsyncIterable<SpecFileOperation> {}

export class SpecFileOperations {
  static async *fromSpecPatches(
    specPatches: SpecPatches,
    sourcemap: SpecFilesSourcemap
  ): AsyncIterable<SpecFileOperation> {
    const sourcemapQueries = sourcemapReader(sourcemap);

    let operations = SpecPatches.operations(specPatches);

    for await (let operation of operations) {
      const result = sourcemapQueries.findFilePosition(operation.path);

      invariant(
        result,
        'should be able to resolve the file for json patch operation in source map'
      );

      const { filePath, startsAt } = result;

      yield {
        filePath,
        operation: { ...operation, path: startsAt },
      };
    }
  }

  static async *fromNewFilePatches(
    absoluteFilePath: string,
    specPatches: SpecPatches
  ): SpecFileOperations {
    let operations = SpecPatches.operations(specPatches);

    for await (let operation of operations) {
      yield { filePath: absoluteFilePath, operation };
    }
  }
}

export interface SpecFiles extends Iterable<SpecFile> {}
export interface SpecFilesAsync extends AsyncIterable<SpecFile> {}

export class SpecFiles {
  static *fromSourceMap(sourcemap: SpecFilesSourcemap): SpecFiles {
    for (let file of sourcemap.files) {
      yield {
        path: file.path,
        contents: file.contents,
      };
    }
  }

  static async *patch(
    specFiles: SpecFiles,
    fileOperations: SpecFileOperations
  ): SpecFilesAsync {
    const files = [...specFiles];

    const operationsByFile: { [key: string]: Operation[] } = {};

    // buffer all the operations per path, to reconcile once per file
    for await (let { filePath, operation } of fileOperations) {
      if (!operationsByFile[filePath]) operationsByFile[filePath] = [];

      operationsByFile[filePath]!.push(operation);
    }

    for (let [filePath, operations] of Object.entries(operationsByFile)) {
      const file = files.find(({ path }) => path === filePath)!;

      yield await SpecFile.applyPatch(file, operations);
    }
  }

  static async *writeFiles(specFiles: SpecFilesAsync): AsyncIterable<string> {
    for await (let { path, contents } of specFiles) {
      await fs.writeFile(path, contents);
      yield path;
    }
  }
}

export class SpecFilesAsync {}
