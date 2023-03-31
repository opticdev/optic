import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function createNewSpecFile(
  version: '3.0.3' | '3.1.0'
): OpenAPIV3.Document {
  return {
    info: {
      title: 'Untitled service',
      version: '1.0.0',
    },
    openapi: version,
    paths: {},
  };
}
