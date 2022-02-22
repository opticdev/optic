import { BodyLocation } from '../body';
import { ShapeDiffResult } from '../diffs';
import { SchemaObject } from '../schema';

import { PatchImpact, OperationGroup } from '../../patches';

export { PatchImpact, OperationGroup };

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
