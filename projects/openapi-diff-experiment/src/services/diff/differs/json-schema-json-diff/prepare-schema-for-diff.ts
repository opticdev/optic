import jsonSchemaTraverse from 'json-schema-traverse';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { copyObject } from '../../../../utils/debug_waitFor';
/*
  Some developers don't set all the JSON Schema properties because it's quite verbose,
  effectively underspecifing their schemas. Optic tries to apply sensible defaults,
  which are easy to override by writing your schemas properly
 */
export function prepareSchemaForDiff(
  input: OpenAPIV3.SchemaObject
): OpenAPIV3.SchemaObject {
  const schema = copyObject(input);
  jsonSchemaTraverse(schema, {
    allKeys: true,
    cb: (schema) => {
      if (
        schema.type === 'object' &&
        !schema.hasOwnProperty('additionalProperties')
      ) {
        schema['additionalProperties'] = false;
      }
    },
  });
  return schema;
}
