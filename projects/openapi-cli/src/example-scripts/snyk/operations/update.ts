import { commonHeaders, commonResponses, refs } from '../common';
import { ensureIdParameter } from '../parameters';
import {
  buildItemResponseSchema,
  buildUpdateRequestSchema,
  ensureRelationSchema,
} from '../schemas';
import { OpenAPIV3 } from 'openapi-types';
import { SpecTemplate } from '../../../sdk';

export const addUpdateOperation = SpecTemplate.create(
  'add-update-operation',
  function addUpdateOperation(
    spec: OpenAPIV3.Document,
    options: {
      itemPath: string;
      resourceName: string;
      titleResourceName: string;
    }
  ): void {
    const { itemPath, resourceName, titleResourceName } = options;
    if (!spec.paths) spec.paths = {};
    if (!spec.paths[itemPath]) spec.paths[itemPath] = {};
    if (!spec.components) spec.components = {};
    if (!spec.components.schemas) spec.components.schemas = {};
    spec.paths[itemPath]!.patch = buildUpdateOperation(
      resourceName,
      titleResourceName
    );
    const attributes =
      spec.components?.schemas?.[`${titleResourceName}Attributes`];
    if (!attributes)
      throw new Error(`Could not find ${titleResourceName}Attributes schema`);
    spec.components.schemas[`${titleResourceName}UpdateAttributes`] =
      attributes;
    ensureIdParameter(spec, resourceName, titleResourceName);
    ensureRelationSchema(spec, titleResourceName);
  }
);

function buildUpdateOperation(
  resourceName: string,
  titleResourceName: string
): OpenAPIV3.OperationObject {
  const itemResponseSchema = buildItemResponseSchema(
    resourceName,
    titleResourceName
  );
  const updateRequestSchema = buildUpdateRequestSchema(titleResourceName);
  return {
    summary: `Update an instance of ${resourceName}`,
    description: `Update an instance of ${resourceName}`,
    operationId: `update${titleResourceName}`,
    tags: [titleResourceName],
    parameters: [
      refs.parameters.version,
      { $ref: `#/components/parameters/${titleResourceName}Id` },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: updateRequestSchema,
        },
      },
    },
    responses: {
      '200': {
        description: `Instance of ${resourceName} is updated`,
        headers: commonHeaders,
        content: {
          'application/vnd.api+json': {
            schema: itemResponseSchema,
          },
        },
      },
      '204': refs.responses['204'],
      ...commonResponses,
    },
  };
}
