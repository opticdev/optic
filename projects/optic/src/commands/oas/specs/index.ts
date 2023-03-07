export { readDeferencedSpec } from './io';

import { ShapeLocation } from '../shapes';

export {
  OpenAPIV3,
  isFactVariant,
  OpenApiKind as FactVariants,
} from '@useoptic/openapi-utilities';

export type SpecLocation = ShapeLocation; // TODO: add union of all conceptual locations

// files
export { SpecFile, SpecFilesSourcemap } from './files';
export type { SpecFileOperation } from './files';

// patches and operations
export { SpecPatch } from './patches';
export { SpecPatches } from './streams/patches';
export { SpecFileOperations, SpecFiles, SpecFilesAsync } from './streams/files';
export {
  SpecFacts,
  SpecFactsIterable,
  BodyExampleFacts,
  ComponentSchemaExampleFacts,
  OperationFacts,
} from './streams/facts';
export type {
  BodyExampleFact,
  ComponentSchemaExampleFact,
  OperationFact,
} from './streams/facts';

// templates
export { SpecTemplate } from './templates';
