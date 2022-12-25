import { Operation as PatchOperation } from 'fast-json-patch';
import { ShapeDiffResult } from '../shapes/diffs';
import { OperationDiffResult } from '../operations/diffs';

export interface PatchOperationGroup {
  intent: string; // human readable
  diff: ShapeDiffResult | OperationDiffResult | undefined;
  operations: PatchOperation[];
}

export type { PatchOperation };

export enum PatchImpact {
  BackwardsCompatible = 'BackwardsCompatible',
  BackwardsIncompatible = 'BackwardsIncompatible',
  BackwardsCompatibilityUnknown = 'BackwardsCompatibilityUnknown',
  Addition = 'Addition',
}

export class PatchOperationGroup {
  static create(
    intent: string,
    diff: ShapeDiffResult | OperationDiffResult | undefined,
    ...operations: PatchOperation[]
  ): PatchOperationGroup {
    return { intent, diff, operations };
  }

  static *operations(
    group: PatchOperationGroup
  ): IterableIterator<PatchOperation> {
    yield* group.operations;
  }
}
