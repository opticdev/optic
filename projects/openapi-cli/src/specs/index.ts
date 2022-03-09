import { ShapeLocation } from '../shapes';

export { OpenAPIV3 } from '@useoptic/openapi-utilities';

export type SpecLocation = ShapeLocation; // TODO: add union of all conceptual locations

// files
export { SpecFile } from './files';
export type { SpecFilesSourcemap, SpecFileOperation } from './files';

// patches and operations
export { SpecPatch } from './patches';
export { SpecPatches } from './streams/patches';
export { SpecFileOperations, SpecFiles } from './streams/files';
export { SpecFacts, BodyExampleFacts } from './streams/facts';
export type { BodyExampleFact } from './streams/facts';

// templates
export { SpecTemplate } from './templates';
