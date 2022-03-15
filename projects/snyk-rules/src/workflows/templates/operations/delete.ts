import { commonResponses, refs } from '../common';
import { ensureIdParameter } from '../parameters';
import { OpenAPIV3 } from 'openapi-types';
import { SpecTemplate } from '@useoptic/openapi-cli';

export const addDeleteOperation = SpecTemplate.create(
  'add-delete-operation',
  function addDeleteOperation(
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
    spec.paths[itemPath]!.delete = buildDeleteOperation(
      resourceName,
      titleResourceName
    );
    ensureIdParameter(spec, resourceName, titleResourceName);
  }
);

function buildDeleteOperation(
  resourceName: string,
  titleResourceName: string
): OpenAPIV3.OperationObject {
  return {
    summary: `Delete an instance of ${resourceName}`,
    description: `Delete an instance of ${resourceName}`,
    operationId: `delete${titleResourceName}`,
    tags: [titleResourceName],
    parameters: [
      { $ref: '../../../components/parameters/version.yaml#/Version' },
      { $ref: `#/components/parameters/${titleResourceName}Id` },
    ],
    responses: {
      '204': refs.responses['204'],
      ...commonResponses,
    },
  };
}
