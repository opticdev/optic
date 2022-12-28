import { OperationDiffResult } from '../diffs';
import { Operation } from '..';
import {
  PatchImpact,
  PatchOperationGroup,
  PatchOperation,
} from '../../patches';
import JsonPatch, { JsonPatchError } from 'fast-json-patch';
import { Result, Ok, Err } from 'ts-results';

export type { PatchOperation };
export { PatchOperationGroup, PatchImpact };
import { diffOperationPatchGenerators } from './generators';
import { ShapeDiffResult } from '../../shapes/diffs';

export function* generateOperationPatchesByDiff(
  diff: OperationDiffResult,
  operation: Operation,
  context?: {
    statusCode: string;
  }
): IterableIterator<OperationPatch> {
  for (let generator of diffOperationPatchGenerators) {
    yield* generator(diff, operation, context);
  }
}

export interface OperationPatch {
  description: string;
  impact: PatchImpact[];
  diff: ShapeDiffResult | OperationDiffResult | undefined;
  groupedOperations: PatchOperationGroup[];
}

export class OperationPatch {
  static *operations(patch: OperationPatch): IterableIterator<PatchOperation> {
    for (let group of patch.groupedOperations) {
      yield* PatchOperationGroup.operations(group);
    }
  }

  static isAddition(patch: OperationPatch): boolean {
    return patch.impact.includes(PatchImpact.Addition);
  }

  static applyTo(
    patch: OperationPatch,
    operation: Operation | null
  ): Result<Operation, JsonPatchError> {
    try {
      const result = JsonPatch.applyPatch(
        operation,
        JsonPatch.deepClone([...OperationPatch.operations(patch)]),
        true, // validate ops so we get useful error messages
        false // don't mutate the original schema
      );

      return Ok(result.newDocument!);
    } catch (err) {
      if (err instanceof JsonPatchError) {
        return Err(err);
      } else {
        throw err;
      }
    }
  }
}
