import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getParameterIdentity } from './array-identifiers';
import { FlatOpenAPIV3 } from '../flat-openapi-types';

const methods = `{get,post,put,delete,patch,head,options}`;
export const isPathParameterArray = (pointer: string): boolean => {
  return (
    jsonPointerHelpers.matches(pointer, ['paths', '**', 'parameters']) ||
    jsonPointerHelpers.matches(pointer, ['paths', '**', methods, 'parameters'])
  );
};

export const isPathsMap = (pointer: string): boolean => {
  return jsonPointerHelpers.matches(pointer, ['paths']);
};

export const inJsonSchema = (pointer: string): boolean => {
  return (
    jsonPointerHelpers.startsWith(pointer, [
      'paths',
      '**',
      methods,
      'parameters',
      '**',
      'schema',
    ]) ||
    jsonPointerHelpers.startsWith(pointer, [
      'paths',
      '**',
      methods,
      'responses',
      '**',
      'content',
      '**/**',
      'schema',
    ]) ||
    jsonPointerHelpers.startsWith(pointer, [
      'paths',
      '**',
      methods,
      'requestBody',
      'content',
      '**/**',
      'schema',
    ])
  );
};

export const isAnObjectAllOf = (
  pointer: string,
  schema: FlatOpenAPIV3.SchemaObject
) => {
  return (
    inJsonSchema(pointer) &&
    schema.allOf &&
    schema.allOf.length &&
    schema.allOf.every((childSchema) => childSchema.type === 'object')
  );
};

export const isAnObject = (
  pointer: string,
  schema: FlatOpenAPIV3.SchemaObject
) => {
  return (
    inJsonSchema(pointer) &&
    !schema.allOf &&
    schema.type &&
    schema.type === 'object'
  );
};
