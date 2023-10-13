import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { FlatOpenAPIV3_1, OpenAPIV3 } from '@useoptic/openapi-utilities';

export function isInUnionProperty(jsonPath: string): boolean {
  const parts = jsonPointerHelpers.decode(jsonPath);
  return parts.some((p) => p === 'oneOf' || p === 'anyOf');
}

export function schemaIsUnionProperty(schema: OpenAPIV3.SchemaObject): boolean {
  return !!(schema.oneOf || schema.anyOf);
}

type KeyNode = {
  required: boolean;
  type: string[];
};
type KeyMap = Map<string, KeyNode | KeyMap[]>;

// Return an array of Maps that have different keys that they require; if there is a oneOf or anyOf
// create a key with multiple sets
function createKeyMapFromSchema(schema: FlatOpenAPIV3_1.SchemaObject): KeyMap {
  const keyMap: KeyMap = new Map();

  function traverseSchema(schema: FlatOpenAPIV3_1.SchemaObject, path: string) {
    if (schema.type === 'object') {
      if (schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
          const fullKey = `${path}.${key}`;
          if (!value.type) {
            if (value.oneOf)
              keyMap.set(
                fullKey,
                value.oneOf.map((s) => createKeyMapFromSchema(s))
              );
            else if (value.anyOf)
              keyMap.set(
                fullKey,
                value.anyOf.map((s) => createKeyMapFromSchema(s))
              );
          } else {
            const node: KeyNode = {
              required: schema.required ? schema.required.includes(key) : false,
              type: Array.isArray(value.type) ? value.type : [value.type],
            };

            keyMap.set(fullKey, node);

            if (value.type === 'object' || value.type === 'array')
              traverseSchema(value, fullKey);
          }
        }
      }
    } else if (schema.type === 'array') {
      if (schema.items) {
        const fullKey = `${path}.items`;
        if (!schema.items.type) {
          if (schema.items.oneOf)
            keyMap.set(
              fullKey,
              schema.items.oneOf.map((s) => createKeyMapFromSchema(s))
            );
          else if (schema.items.anyOf)
            keyMap.set(
              fullKey,
              schema.items.anyOf.map((s) => createKeyMapFromSchema(s))
            );
        } else {
          const node: KeyNode = {
            required: false,
            type: Array.isArray(schema.items.type)
              ? schema.items.type
              : [schema.items.type],
          };

          keyMap.set(fullKey, node);

          if (schema.items.type === 'object' || schema.items.type === 'array')
            traverseSchema(schema.items, fullKey);
        }
      }
    }
  }

  traverseSchema(schema, '');
  return keyMap;
}

export function computeUnionTransition(
  before: OpenAPIV3.SchemaObject,
  after: OpenAPIV3.SchemaObject
): {
  expanded: boolean;
  narrowed: boolean;
} {
  const results = {
    expanded: false,
    narrowed: false,
  };

  const b = before as FlatOpenAPIV3_1.SchemaObject;
  const a = after as FlatOpenAPIV3_1.SchemaObject;

  const beforeMaps = b.oneOf
    ? b.oneOf.map((s) => createKeyMapFromSchema(s))
    : b.anyOf
    ? b.anyOf.map((s) => createKeyMapFromSchema(s))
    : createKeyMapFromSchema(b);
  const afterMaps = a.oneOf
    ? a.oneOf.map((s) => createKeyMapFromSchema(s))
    : a.anyOf
    ? a.anyOf.map((s) => createKeyMapFromSchema(s))
    : createKeyMapFromSchema(a);

  // TODO compute diff here

  // For each schema:
  // - compute the keymap from schema which summarizes the data from the schema
  // - then collapse and check every key has a valid transition
  //    - if oneOf or anyOf and checking for expanded
  //      - required keys are greater than any of the subset transitions
  //    - if oneOf or anyOf and checking for narrowed
  //      - required keys are less than any of the subset transitions
  //    - if pattern, min/max, etc - we can apply the same narrow / expanded check

  return results;
}
