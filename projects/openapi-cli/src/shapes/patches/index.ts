import { Operation } from 'fast-json-patch';

export interface ShapePatch {
  description: string;
  impact: PatchImpact[];
  groupedOperations: OperationGroup[];
}

export interface OperationGroup {
  intent: string; // human readable
  operations: Operation[];
}

export type { Operation };

export enum PatchImpact {
  BackwardsCompatible = 'BackwardsCompatible',
  BackwardsIncompatible = 'BackwardsIncompatible',
  Addition = 'Addition',
}

export class OperationGroup {
  static create(intent: string, ...operations: Operation[]): OperationGroup {
    return { intent, operations };
  }
}
