import { OpenAPIV3 } from 'openapi-types';
import {
  buildCollectionResponseSchema,
  ensureRelationSchema,
} from '../schemas';
import {
  commonHeaders,
  commonResponses,
  paginationParameters,
  refs,
} from '../common';

export function addListOperation(
  spec: OpenAPIV3.Document,
  collectionPath: string,
  resourceName: string,
  titleResourceName: string
): void {
  if (!spec.paths) spec.paths = {};
  if (!spec.paths[collectionPath]) spec.paths[collectionPath] = {};
  spec.paths[collectionPath]!.get = buildListOperation(
    resourceName,
    titleResourceName
  );
  ensureRelationSchema(spec, titleResourceName);
}

function buildListOperation(
  resourceName: string,
  titleResourceName: string
): OpenAPIV3.OperationObject {
  const collectionResponseSchema = buildCollectionResponseSchema(
    resourceName,
    titleResourceName
  );
  return {
    summary: `List instances of ${resourceName}`,
    description: `List instances of ${resourceName}`,
    operationId: `list${titleResourceName}`,
    tags: [titleResourceName],
    parameters: [refs.parameters.version, ...paginationParameters],
    responses: {
      '200': {
        description: `Returns a list of ${resourceName} instances`,
        headers: commonHeaders,
        content: {
          'application/vnd.api+json': {
            schema: collectionResponseSchema,
          },
        },
      },
      ...commonResponses,
    },
  };
}
