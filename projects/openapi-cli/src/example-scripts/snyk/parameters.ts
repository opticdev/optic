import { OpenAPIV3 } from 'openapi-types';

export function ensureIdParameter(
  spec: OpenAPIV3.Document,
  resourceName: string,
  titleResourceName: string
): void {
  if (!spec.components) spec.components = {};
  if (!spec.components.parameters) spec.components.parameters = {};
  spec.components.parameters[`${titleResourceName}Id`] = {
    name: `${resourceName}_id`,
    in: 'path',
    required: true,
    description: `Unique identifier for ${resourceName} instances`,
    schema: {
      type: 'string',
      format: 'uuid',
    },
  };
}
