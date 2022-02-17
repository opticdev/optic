import { BodyLocation } from '../body';
import { Operation } from 'fast-json-patch';
import { ShapeDiffResult } from '../diffs';
import { SchemaObject } from '../schema';

import { shapePatchGenerators } from './generators';

export function* generateShapePatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location: BodyLocation }
): IterableIterator<ShapePatch> {
  for (let generator of shapePatchGenerators) {
    yield* generator(diff, schema, shapeContext);
  }
}

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
