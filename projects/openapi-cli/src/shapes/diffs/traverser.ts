import jsonSchemaTraverse from 'json-schema-traverse';
import { SchemaObject, Body } from '../body';
import { ShapeDiffResult } from './result';
import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import { OpenAPIV3 } from '../../specs';

import { diffVisitors } from './visitors';

export type { ErrorObject };

export class ShapeDiffTraverser {
  private validator: Ajv;

  private validate?: ValidateFunction;
  private bodyValue?: any;

  constructor() {
    this.validator = new Ajv({
      allErrors: true,
      validateFormats: false,
      strictSchema: false,
      useDefaults: true,
    });
  }

  traverse(bodyValue: any, schema: SchemaObject) {
    this.bodyValue = bodyValue;
    this.validate = this.validator.compile(prepareSchemaForDiff(schema));
    this.validate(bodyValue);
  }

  *results(): IterableIterator<ShapeDiffResult> {
    if (!this.validate) return;

    if (this.validate.errors) {
      for (let error of this.validate.errors) {
        yield* diffVisitors(error, this.bodyValue);
      }
    }
  }
}

export enum JsonSchemaKnownKeyword {
  required = 'required',
  additionalProperties = 'additionalProperties',
  type = 'type',
  oneOf = 'oneOf',
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
