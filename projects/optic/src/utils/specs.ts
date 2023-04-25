import { OpenAPIV3, defaultEmptySpec } from '@useoptic/openapi-utilities';
import { OPTIC_EMPTY_SPEC_KEY } from '../constants';
import { JsonSchemaSourcemap } from '@useoptic/openapi-io';

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

export function createNullSpec(): OpenAPIV3.Document {
  return {
    ...defaultEmptySpec,
    [OPTIC_EMPTY_SPEC_KEY]: true,
  } as OpenAPIV3.Document;
}

export function createNullSpecSourcemap(
  nullSpec: OpenAPIV3.Document
): JsonSchemaSourcemap {
  const emptySpecName = 'empty.json';
  const sourcemap = new JsonSchemaSourcemap(emptySpecName);
  sourcemap.addFileIfMissingFromContents(
    emptySpecName,
    JSON.stringify(nullSpec, null, 2),
    0
  );
  return sourcemap;
}
