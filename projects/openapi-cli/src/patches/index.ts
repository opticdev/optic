import { Operation } from 'fast-json-patch';

export interface OperationGroup {
  intent: string; // human readable
  operations: Operation[];
}

export type { Operation };

export enum PatchImpact {
  BackwardsCompatible = 'BackwardsCompatible',
  BackwardsIncompatible = 'BackwardsIncompatible',
  BackwardsCompatibilityUnknown = 'BackwardsCompatibilityUnknown',
  Addition = 'Addition',
}

export class OperationGroup {
  static create(intent: string, ...operations: Operation[]): OperationGroup {
    return { intent, operations };
  }

  static *operations(group: OperationGroup): IterableIterator<Operation> {
    yield* group.operations;
  }
}
