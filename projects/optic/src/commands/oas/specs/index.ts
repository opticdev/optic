export { readDeferencedSpec } from './io';

export {
  OpenAPIV3,
  isFactVariant,
  OpenApiKind as FactVariants,
} from '@useoptic/openapi-utilities';

// files
export { SpecFile, SpecFilesSourcemap } from './files';
export type { SpecFileOperation } from './files';

// patches and operations
export { SpecFileOperations, SpecFiles, SpecFilesAsync } from './streams/files';

// templates
export { SpecTemplate } from './templates';
