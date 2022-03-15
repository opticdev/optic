import { commonHeaders, commonResponses, refs } from '../common';
import { OpenAPIV3 } from 'openapi-types';
import {
  buildCreateRequestSchema,
  buildItemResponseSchema,
  ensureRelationSchema,
} from '../schemas';
import { SpecTemplate } from '@useoptic/openapi-cli';

export const addCreateOperation = SpecTemplate.create(
  'add-create-operation',
  function addCreateOperation(
    spec: OpenAPIV3.Document,
    options: {
      collectionPath: string;
      resourceName: string;
      titleResourceName: string;
    }
  ): void {
    const { collectionPath, resourceName, titleResourceName } = options;
    if (!spec.paths) spec.paths = {};
    if (!spec.paths[collectionPath]) spec.paths[collectionPath] = {};
    if (!spec.components) spec.components = {};
    if (!spec.components.schemas) spec.components.schemas = {};
    spec.paths[collectionPath]!.post = buildCreateOperation(
      resourceName,
      titleResourceName
    );
    const attributes =
      spec.components?.schemas?.[`${titleResourceName}Attributes`];
    if (!attributes)
      throw new Error(`Could not find ${titleResourceName}Attributes schema`);
    spec.components.schemas[`${titleResourceName}CreateAttributes`] =
      attributes;
    ensureRelationSchema(spec, titleResourceName);
  }
);

function buildCreateOperation(
  resourceName: string,
  titleResourceName: string
): OpenAPIV3.OperationObject {
  const itemResponseSchema = buildItemResponseSchema(
    resourceName,
    titleResourceName
  );
  const createRequestSchema = buildCreateRequestSchema(titleResourceName);
  return {
    summary: `Create a new ${resourceName}`,
    description: `Create a new ${resourceName}`,
    operationId: `create${titleResourceName}`,
    tags: [titleResourceName],
    parameters: [refs.parameters.version],
    requestBody: {
      content: {
        'application/json': {
          schema: createRequestSchema,
        },
      },
    },
    responses: {
      '201': {
        description: `Created ${resourceName} successfully`,
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
