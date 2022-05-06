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

export function* generateOperationPatchesByDiff(
  diff: OperationDiffResult,
  operation: Operation
): IterableIterator<OperationPatch> {}

export interface OperationPatch {
  description: string;
  impact: PatchImpact[];
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
        [...OperationPatch.operations(patch)],
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
