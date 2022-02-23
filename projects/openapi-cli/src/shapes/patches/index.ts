import { BodyLocation } from '../body';
import { ShapeDiffResult } from '../diffs';
import { SchemaObject, Schema } from '../schema';

import { PatchImpact, OperationGroup } from '../../patches';

export { PatchImpact, OperationGroup };

import { diffShapePatchGenerators, newSchemaPatch } from './generators';

export function* generateShapePatchesByDiff(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location: BodyLocation }
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
