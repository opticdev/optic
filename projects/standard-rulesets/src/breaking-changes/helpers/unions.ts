import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  FlatOpenAPIV3_1,
  OpenAPIV3,
  OpenAPIV3_1,
} from '@useoptic/openapi-utilities';
import { computeTypeTransition } from './type-change';

export function isInUnionProperty(jsonPath: string): boolean {
  const parts = jsonPointerHelpers.decode(jsonPath);
  return parts.some((p) => p === 'oneOf' || p === 'anyOf');
}

export function schemaIsUnion(
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): schema is OpenAPIV3.SchemaObject {
  return !!(schema && !('$ref' in schema) && (schema.oneOf || schema.anyOf));
}

type KeyNode =
  | {
      required: boolean;
      schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject;
      keyword: 'type';
    }
  | {
      required: boolean;
      type: KeyMap[];
      keyword: 'oneOf' | 'anyOf' | 'typeArray';
    };
type KeyMap = Map<string, KeyNode>;

function traverseTypeArraySchemas(
  schema: FlatOpenAPIV3_1.SchemaObject
): KeyMap[] {
  return Array.isArray(schema.type)
    ? schema.type.map((type) => {
        if (type === 'object') {
          const { items, ...newSchema } = { ...schema } as any;
          newSchema.type = 'object';
          return createKeyMapFromSchema(newSchema);
        } else if (type === 'array') {
          const { properties, ...newSchema } = { ...schema } as any;
          newSchema.type = 'array';

          return createKeyMapFromSchema(newSchema);
        } else {
          const { items, properties, ...newSchema } = { ...schema } as any;
          newSchema.type = type;

          return createKeyMapFromSchema(newSchema);
        }
      })
    : [];
}

// Return an array of Maps that have different keys that they require; if there is a oneOf or anyOf
// create a key with multiple sets
function createKeyMapFromSchema(schema: FlatOpenAPIV3_1.SchemaObject): KeyMap {
  const keyMap: KeyMap = new Map();

  function traverseSchema(schema: FlatOpenAPIV3_1.SchemaObject, path: string) {
    if (schema.type === 'object') {
      if (schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
          const fullKey = `${path}.${key}`;
          const required = schema.required
            ? schema.required.includes(key)
            : false;
          if (!value.type) {
            if (value.oneOf)
              keyMap.set(fullKey, {
                required,
                type: value.oneOf.map((s) => createKeyMapFromSchema(s)),
                keyword: 'oneOf',
              });
            else if (value.anyOf)
              keyMap.set(fullKey, {
                required,
                type: value.anyOf.map((s) => createKeyMapFromSchema(s)),
                keyword: 'anyOf',
              });
          } else {
            const required = schema.required
              ? schema.required.includes(key)
              : false;
            const node: KeyNode = Array.isArray(value.type)
              ? {
                  required,
                  type: traverseTypeArraySchemas(value),
                  keyword: 'typeArray',
                }
              : {
                  required,
                  schema: value,
                  keyword: 'type',
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
            keyMap.set(fullKey, {
              required: false,
              type: schema.items.oneOf.map((s) => createKeyMapFromSchema(s)),
              keyword: 'oneOf',
            });
          else if (schema.items.anyOf)
            keyMap.set(fullKey, {
              required: false,
              type: schema.items.anyOf.map((s) => createKeyMapFromSchema(s)),
              keyword: 'anyOf',
            });
        } else {
          const node: KeyNode = Array.isArray(schema.items.type)
            ? {
                required: false,
                type: traverseTypeArraySchemas(schema.items),
                keyword: 'typeArray',
              }
            : {
                required: false,
                schema: schema.items,
                keyword: 'type',
              };

          keyMap.set(fullKey, node);

          if (schema.items.type === 'object' || schema.items.type === 'array')
            traverseSchema(schema.items, fullKey);
        }
      }
    }
  }

  if (schema.type) {
    const node: KeyNode = Array.isArray(schema.type)
      ? {
          required: false,
          type: traverseTypeArraySchemas(schema),
          keyword: 'typeArray',
        }
      : {
          required: false,
          schema,
          keyword: 'type',
        };

    keyMap.set('', node);

    traverseSchema(schema, '');
  }
  return keyMap;
}

function diffKeyMaps(aMap: KeyMap, bMap: KeyMap) {
  const results = {
    expanded: false,
    narrowed: false,
  };
  for (const [key, aValue] of aMap) {
    const bValue = bMap.get(key);
    if (bValue) {
      if (aValue.keyword === 'type' && bValue.keyword === 'type') {
        const typeTransition = computeTypeTransition(aValue, bValue);
        // TODO add in reasons why something failed
        if (
          typeTransition.expanded.enum ||
          typeTransition.expanded.requiredChange ||
          typeTransition.expanded.typeChange
        ) {
          results.expanded = true;
        }
        if (
          typeTransition.narrowed.enum ||
          typeTransition.narrowed.requiredChange ||
          typeTransition.narrowed.typeChange
        ) {
          results.narrowed = true;
        }
      } else if (aValue.keyword === 'type' || bValue.keyword === 'type') {
        if (aValue.keyword === 'type' && bValue.keyword !== 'type') {
          results.expanded = true;
        } else {
          results.narrowed = true;
        }
      } else {
        // A type is considered narrowed if any before item does not have an equivalent set with any item in the after set
        const isNarrowed = !aValue.type.every((aKeyMap) =>
          bValue.type.some((bKeyMap) => !diffKeyMaps(aKeyMap, bKeyMap).narrowed)
        );
        // A type is considered expanded if any after item does not have an equivalent set with any item in the before set
        const isExpanded = !bValue.type.every((bKeyMap) =>
          aValue.type.some((aKeyMap) => !diffKeyMaps(aKeyMap, bKeyMap).expanded)
        );

        if (isNarrowed) results.narrowed = true;
        if (isExpanded) results.expanded = true;
      }
    } else if (aValue.required) {
      results.narrowed = true;
    }
  }

  for (const [key, bValue] of bMap) {
    if (!aMap.has(key) && bValue.required) {
      results.expanded = true;
    }
  }

  return results;
}

export function computeUnionTransition(
  before:
    | OpenAPIV3.SchemaObject
    | OpenAPIV3_1.SchemaObject
    | OpenAPIV3.ReferenceObject,
  after:
    | OpenAPIV3.SchemaObject
    | OpenAPIV3_1.SchemaObject
    | OpenAPIV3.ReferenceObject
): {
  expanded: boolean;
  narrowed: boolean;
} {
  const b = before as FlatOpenAPIV3_1.SchemaObject;
  const a = after as FlatOpenAPIV3_1.SchemaObject;

  const beforeMaps = b.oneOf
    ? b.oneOf.map((s) => createKeyMapFromSchema(s))
    : b.anyOf
    ? b.anyOf.map((s) => createKeyMapFromSchema(s))
    : Array.isArray(b.type)
    ? traverseTypeArraySchemas(b)
    : [createKeyMapFromSchema(b)];
  const afterMaps = a.oneOf
    ? a.oneOf.map((s) => createKeyMapFromSchema(s))
    : a.anyOf
    ? a.anyOf.map((s) => createKeyMapFromSchema(s))
    : Array.isArray(a.type)
    ? traverseTypeArraySchemas(a)
    : [createKeyMapFromSchema(a)];

  // A type is considered narrowed if any before item does not have an equivalent set with any item in the after set
  const isNarrowed = !beforeMaps.every((beforeKeyMap) =>
    afterMaps.some(
      (afterKeyMap) => !diffKeyMaps(beforeKeyMap, afterKeyMap).narrowed
    )
  );
  // A type is considered expanded if any after item does not have an equivalent set with any item in the before set
  const isExpanded = !afterMaps.every((afterKeyMap) =>
    beforeMaps.some(
      (beforeKeyMap) => !diffKeyMaps(beforeKeyMap, afterKeyMap).expanded
    )
  );

  return {
    narrowed: isNarrowed,
    expanded: isExpanded,
  };
}
