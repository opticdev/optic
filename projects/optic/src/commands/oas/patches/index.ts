import { Operation as PatchOperation } from 'fast-json-patch';

export interface PatchOperationGroup {
  intent: string; // human readable
  operations: PatchOperation[];
}

export type { PatchOperation };

export enum PatchImpact {
  BackwardsCompatible = 'BackwardsCompatible',
  BackwardsIncompatible = 'BackwardsIncompatible',
  BackwardsCompatibilityUnknown = 'BackwardsCompatibilityUnknown',
  Addition = 'Addition',
  Refactor = 'Refactor',
}

export class PatchOperationGroup {
  static create(
    intent: string,
    ...operations: PatchOperation[]
  ): PatchOperationGroup {
    return { intent, operations };
  }

  static *operations(
    group: PatchOperationGroup
  ): IterableIterator<PatchOperation> {
    yield* group.operations;
  }
}
