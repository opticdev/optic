import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function isInUnionProperty(jsonPath: string): boolean {
  const parts = jsonPointerHelpers.decode(jsonPath);
  return parts.some((p) => p === 'oneOf' || p === 'anyOf');
}

export function schemaIsUnionProperty(schema: OpenAPIV3.SchemaObject): boolean {
  return !!(schema.oneOf || schema.anyOf);
}

// Return an array of Maps that have different keys that they require; if there is a oneOf or anyOf
// create a key with multiple sets
export function createKeySetFromSchema(schema: OpenAPIV3.SchemaObject) {
  // For request properties, required keys
}

export function computeUnionTransition(): {
  expanded: boolean;
  narrowed: boolean;
  identical: boolean;
} {
  const results = {
    expanded: false,
    narrowed: false,
    identical: true,
  };

  return results;
}
