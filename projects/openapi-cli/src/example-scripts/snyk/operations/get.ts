import { ensureIdParameter } from '../parameters';
import { buildItemResponseSchema, ensureRelationSchema } from '../schemas';
import { commonHeaders, commonResponses, refs } from '../common';
import { OpenAPIV3 } from 'openapi-types';

export function addGetOperation(
  spec: OpenAPIV3.Document,
  itemPath: string,
  resourceName: string,
  titleResourceName: string
): void {
  if (!spec.paths) spec.paths = {};
  if (!spec.paths[itemPath]) spec.paths[itemPath] = {};
  spec.paths[itemPath]!.get = buildGetOperation(
    resourceName,
    titleResourceName
  );
  ensureIdParameter(spec, resourceName, titleResourceName);
  ensureRelationSchema(spec, titleResourceName);
}

function buildGetOperation(
  resourceName: string,
  titleResourceName: string
): OpenAPIV3.OperationObject {
  const itemResponseSchema = buildItemResponseSchema(
    resourceName,
    titleResourceName
  );
  return {
    summary: `Get instance of ${resourceName}`,
    description: `Get instance of ${resourceName}`,
    operationId: `get${titleResourceName}`,
    tags: [titleResourceName],
    parameters: [
      refs.parameters.version,
      { $ref: `#/components/parameters/${titleResourceName}Id` },
    ],
    responses: {
      '200': {
        description: `Returns an instance of ${resourceName}`,
        headers: commonHeaders,
        content: {
          'application/vnd.api+json': {
            schema: itemResponseSchema,
          },
        },
      },
      ...commonResponses,
    },
  };
}
