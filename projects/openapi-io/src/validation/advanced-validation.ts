import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import Ajv from 'ajv';

type SchemaUnion = OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;

export function attachAdvancedValidators(ajv: Ajv) {
  ajv.addKeyword({
    keyword: 'x-custom-validator',
    errors: true,
    validate: function myValidation(customValidator: any, schemaFromSpec: any) {
      // @ts-ignore
      if (myValidation.errors === null) myValidation.errors = [];

      try {
        if (customValidator === 'validateSchema')
          validateSchema(schemaFromSpec);
      } catch (e: any) {
        // @ts-ignore
        myValidation.errors.push({
          keyword: 'x-custom-validator',
          message: e.message,
          params: {
            keyword: 'customValidator',
          },
        });
        return false;
      }
      return true;
    },
  });
}

export function validateSchema(schema: SchemaUnion) {
  if (schema.type === 'object') {
    checkForDisallowedKeywords(
      'schema with type "object" cannot also include keywords: ',
      ['allOf', 'anyOf', 'oneOf', 'items'],
      schema
    );
  } else if (schema.type === 'array') {
    checkForDisallowedKeywords(
      'schema with type "array" cannot also include keywords: ',
      ['allOf', 'anyOf', 'oneOf', 'properties', 'required'],
      schema
    );
  } else if (schema.oneOf) {
    checkForDisallowedKeywords(
      'schema with oneOf cannot also include keywords: ',
      ['allOf', 'anyOf', 'type', 'items', 'properties', 'required'],
      schema
    );
  } else if (schema.anyOf) {
    checkForDisallowedKeywords(
      'schema with anyOf cannot also include keywords: ',
      ['allOf', 'oneOf', 'type', 'items', 'properties', 'required'],
      schema
    );
  } else if (schema.allOf) {
    checkForDisallowedKeywords(
      'schema with anyOf cannot also include keywords: ',
      ['anyOf', 'oneOf', 'type', 'items', 'properties', 'required'],
      schema
    );
  }
}

function checkForDisallowedKeywords(
  errorPrefix: string,
  keywords: string[],
  schema: SchemaUnion
) {
  const found = keywords.filter((keyword) =>
    (schema as any).hasOwnProperty(keyword)
  );
  if (found.length) {
    throw new Error(`${errorPrefix}${found.sort().join(', ')}`);
  }
}
