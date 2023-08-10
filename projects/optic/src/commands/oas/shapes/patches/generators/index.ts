import { ShapePatch } from '..';
import { ShapeDiffResult } from '../../diffs';
import { SchemaObject } from '../../schema';
import { ShapeLocation } from '../../';

import { additionalPropertiesPatches } from './additionalProperties';
import { oneOfPatches } from './oneOf';
import { requiredPatches } from './required';
import { typePatches } from './type';
import { newSchemaPatch } from './newSchema';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { enumPatches } from './enum';

export interface DiffShapePatchGenerator {
  (
    diff: ShapeDiffResult,
    schema: SchemaObject,
    shapeContext: { location?: ShapeLocation },
    openAPIVersion: SupportedOpenAPIVersions
  ): IterableIterator<ShapePatch>;
}

export const diffShapePatchGenerators: DiffShapePatchGenerator[] = [
  additionalPropertiesPatches,
  oneOfPatches,
  requiredPatches,
  typePatches,
  enumPatches,
];

export { newSchemaPatch };
