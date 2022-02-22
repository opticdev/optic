import { ShapeLocation } from '../shapes';
import { JsonSchemaSourcemap } from '@useoptic/openapi-io';

export { OpenAPIV3 } from '@useoptic/openapi-utilities';
export type SpecFilesSourcemap = JsonSchemaSourcemap;

export type SpecLocation = ShapeLocation; // TODO: add union of all conceptual locations
export { SpecPatch } from './patches';
export type { SpecFileOperation } from './patches';
export { SpecPatches, SpecFileOperations } from './streams/patches';
