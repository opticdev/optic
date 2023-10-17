import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { FlatOpenAPIV3_1, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { computeEffectiveTypeChange } from './type-change';

export function isInUnionProperty(jsonPath: string): boolean {
  const parts = jsonPointerHelpers.decode(jsonPath);
  return parts.some((p) => p === 'oneOf' || p === 'anyOf');
}

export function schemaIsUnionProperty(schema: OpenAPIV3.SchemaObject): boolean {
  return !!(schema.oneOf || schema.anyOf);
}

type KeyNode =
  | {
      required: boolean;
      type: string[];
      keyword: 'type';
    }
  | {
      required: boolean;
      type: KeyMap[];
      keyword: 'oneOf' | 'anyOf';
    };
type KeyMap = Map<string, KeyNode>;

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
            const node: KeyNode = {
              required: schema.required ? schema.required.includes(key) : false,
              type: Array.isArray(value.type) ? value.type : [value.type],
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
          const node: KeyNode = {
            required: false,
            type: Array.isArray(schema.items.type)
              ? schema.items.type
              : [schema.items.type],
            keyword: 'type',
          };

          keyMap.set(fullKey, node);

          if (schema.items.type === 'object' || schema.items.type === 'array')
            traverseSchema(schema.items, fullKey);
        }
      }
    }
  }
  if (schema.type !== 'array' && schema.type !== 'object') {
    const node: KeyNode = {
      required: false,
      type: Array.isArray(schema.type)
        ? schema.type
        : ([schema.type] as string[]),
      keyword: 'type',
    };

    keyMap.set('', node);
  }
  traverseSchema(schema, '');
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
      // if both typestrings, just check types
      if (aValue.keyword === 'type' && bValue.keyword === 'type') {
        const typeChange = computeEffectiveTypeChange(aValue.type, bValue.type);
        if (typeChange.expanded) results.expanded = true;
        if (typeChange.narrowed) results.narrowed = true;
        // TODO do other breaking change checks like format / pattern / min/max
      } else if (aValue.keyword === 'type' || bValue.keyword === 'type') {
        // TODO do transitions from oneOF to typestrings
      } else {
        // A type is considered narrowed if any before item does not overlap with every item in the after set
        const isNarrowed = aValue.type.some((aKeyMap) =>
          bValue.type.every((bKeyMap) => diffKeyMaps(aKeyMap, bKeyMap).narrowed)
        );
        // A type is considered expanded if any after item does not overlap with every item in the before set
        const isExpanded = bValue.type.some((bKeyMap) =>
          aValue.type.every((aKeyMap) => diffKeyMaps(aKeyMap, bKeyMap).expanded)
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
  before: OpenAPIV3.SchemaObject,
  after: OpenAPIV3.SchemaObject
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
    : [createKeyMapFromSchema(b)];
  const afterMaps = a.oneOf
    ? a.oneOf.map((s) => createKeyMapFromSchema(s))
    : a.anyOf
    ? a.anyOf.map((s) => createKeyMapFromSchema(s))
    : [createKeyMapFromSchema(a)];

  // A type is considered narrowed if any before item does not overlap with every item in the after set
  const isNarrowed = beforeMaps.some((beforeKeyMap) =>
    afterMaps.every(
      (afterKeyMap) => diffKeyMaps(beforeKeyMap, afterKeyMap).narrowed
    )
  );
  // A type is considered expanded if any after item does not overlap with every item in the before set
  const isExpanded = afterMaps.some((afterKeyMap) =>
    beforeMaps.every(
      (beforeKeyMap) => diffKeyMaps(beforeKeyMap, afterKeyMap).expanded
    )
  );

  return {
    narrowed: isNarrowed,
    expanded: isExpanded,
  };
}
