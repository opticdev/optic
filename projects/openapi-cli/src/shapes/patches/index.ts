import { ShapeLocation } from '../body';
import { ShapeDiffResult } from '../diffs';
import { SchemaObject, Schema } from '../schema';

import {
  PatchImpact,
  PatchOperationGroup,
  PatchOperation,
} from '../../patches';

export { PatchImpact, PatchOperationGroup as OperationGroup };

import { diffShapePatchGenerators, newSchemaPatch } from './generators';
import { OperationDiffResult } from '../../operations/diffs';

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
  diff: ShapeDiffResult | OperationDiffResult | undefined;
  impact: PatchImpact[];
  groupedOperations: PatchOperationGroup[];
}

export class ShapePatch {
  static *operations(patch: ShapePatch): IterableIterator<PatchOperation> {
    for (let group of patch.groupedOperations) {
      yield* PatchOperationGroup.operations(group);
    }
  }

  static isAddition(patch: ShapePatch): boolean {
    return patch.impact.includes(PatchImpact.Addition);
  }
}
