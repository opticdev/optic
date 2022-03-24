import { ShapeLocation } from '../body';
import { ShapeDiffResult } from '../diffs';
import { SchemaObject, Schema } from '../schema';

import { PatchImpact, OperationGroup, Operation } from '../../patches';

export { PatchImpact, OperationGroup };

import { diffShapePatchGenerators, newSchemaPatch } from './generators';

export function* generateShapePatchesByDiff(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location?: ShapeLocation }
): IterableIterator<ShapePatch> {
  for (let generator of diffShapePatchGenerators) {
    yield* generator(diff, schema, shapeContext);
  }
}

export { newSchemaPatch };

export interface ShapePatch {
  description: string;
  impact: PatchImpact[];
  groupedOperations: OperationGroup[];
}

export class ShapePatch {
  static *operations(patch: ShapePatch): IterableIterator<Operation> {
    for (let group of patch.groupedOperations) {
      yield* OperationGroup.operations(group);
    }
  }

  static isAddition(patch: ShapePatch): boolean {
    return patch.impact.includes(PatchImpact.Addition);
  }
}
