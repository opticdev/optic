import jsonSchemaTraverse from 'json-schema-traverse';
import { SchemaObject, Body } from '../body';
import { ShapeDiffResult } from './result';
import Ajv, { ErrorObject } from 'ajv';
import { OpenAPIV3 } from '../../specs';

export type { ErrorObject };

export class ShapeDiffTraverser {
  private validator: Ajv;

  constructor() {
    this.validator = new Ajv({
      allErrors: true,
      validateFormats: false,
      strictSchema: false,
      useDefaults: true,
    });
  }

  *traverse(body: Body, schema: SchemaObject) {
    const validate = this.validator.compile(prepareSchemaForDiff(schema));
    const _isValid = validate(body);
  }
}

export enum JsonSchemaKnownKeyword {
  required = 'required',
  additionalProperties = 'additionalProperties',
  type = 'type',
  oneOf = 'oneOf',
}

export interface ShapeDiffVisitor {
  (
    schemaPath: string,
    validationError: ErrorObject,
    example: any
  ): IterableIterator<ShapeDiffResult>;
}

/*
  Some developers don't set all the JSON Schema properties because it's quite verbose,
  effectively underspecifing their schemas. Optic tries to apply sensible defaults,
  which are easy to override by writing your schemas properly
 */
function prepareSchemaForDiff(input: SchemaObject): SchemaObject {
  const schema: SchemaObject = JSON.parse(JSON.stringify(input));
  jsonSchemaTraverse(schema as OpenAPIV3.SchemaObject, {
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
