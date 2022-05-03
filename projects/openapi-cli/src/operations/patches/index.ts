import { OperationDiffResult } from '../diffs';
import { Operation } from '..';
import {
  PatchImpact,
  PatchOperationGroup,
  PatchOperation,
} from '../../patches';
import JsonPatch from 'fast-json-patch';

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
  ): Operation {
    const result = JsonPatch.applyPatch(
      operation,
      [...OperationPatch.operations(patch)],
      undefined,
      false // don't mutate the original schema
    );

    return result.newDocument!;
  }
}
