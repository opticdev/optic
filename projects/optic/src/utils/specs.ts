import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function createNewSpecFile(version: string): OpenAPIV3.Document {
  return {
    info: {
      title: 'Untitled service',
      version: '1.0.0',
    },
    openapi: version,
    paths: {},
  };
}
