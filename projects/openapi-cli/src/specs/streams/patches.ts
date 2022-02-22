import { filter, flatMap } from '../../lib/async-tools';
import {
  SpecPatch,
  SpecFileOperation,
  PatchImpact,
  Operation,
  OperationGroup,
} from '../patches';
import { SpecFilesSourcemap } from '..';
import { sourcemapReader } from '@useoptic/openapi-io';
import invariant from 'ts-invariant';

export interface SpecPatches extends AsyncIterable<SpecPatch> {}

export class SpecPatches {
  static async *additions(patches: SpecPatches): SpecPatches {
    yield* filter<SpecPatch>((patch) =>
      patch.impact.includes(PatchImpact.Addition)
    )(patches);
  }

  static async *operations(patches: SpecPatches): AsyncIterable<Operation> {
    yield* flatMap<SpecPatch, Operation>(async function* (patch) {
      for (let group of patch.groupedOperations) {
        yield* OperationGroup.operations(group);
      }
    })(patches);
  }
}

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
}
