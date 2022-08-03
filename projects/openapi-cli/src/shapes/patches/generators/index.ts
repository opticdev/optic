import { ShapePatch } from '..';
import { ShapeDiffResult } from '../../diffs';
import { SchemaObject } from '../../schema';
import { ShapeLocation } from '../../';

import { additionalPropertiesPatches } from './additionalProperties';
import { oneOfPatches } from './oneOf';
import { requiredPatches } from './required';
import { typePatches } from './type';
import { newSchemaPatch } from './newSchema';

export interface DiffShapePatchGenerator {
  (
    diff: ShapeDiffResult,
    schema: SchemaObject,
    shapeContext: { location?: ShapeLocation }
  ): IterableIterator<ShapePatch>;
}

export const diffShapePatchGenerators: DiffShapePatchGenerator[] = [
  additionalPropertiesPatches,
  oneOfPatches,
  requiredPatches,
  typePatches,
];

export { newSchemaPatch };
