import { defaultEmptySpec } from '../../read/debug-implementations';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function specWithPaths(pathsStrings: string[]): OpenAPIV3.Document {
  const paths = {};

  pathsStrings.forEach((path) => {
    const operation: OpenAPIV3.OperationObject = {
      summary: '',
      responses: {},
    };
    // @ts-ignore
    paths[path] = {
      get: operation,
    };
  });

  return {
    ...defaultEmptySpec,
    paths,
  };
}
