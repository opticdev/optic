import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  FlatOpenAPIV3_1,
  OpenAPIV3,
  OpenAPIV3_1,
  OpenApi3SchemaFact,
} from '@useoptic/openapi-utilities';
import { computeTypeTransition } from './type-change';

export function isInUnionProperty(jsonPath: string): boolean {
  const parts = jsonPointerHelpers.decode(jsonPath);
  return parts.some((p) => p === 'oneOf' || p === 'anyOf');
}

export function schemaIsUnion(
  schema?:
    | OpenAPIV3.SchemaObject
    | OpenAPIV3.ReferenceObject
    | OpenApi3SchemaFact
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

type UnionDiffResult = {
  expanded: boolean;
  expandedReasons: string[];
  narrowed: boolean;
  narrowedReasons: string[];
};

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

function areKeymapsNarrowed(
  aKeymaps: KeyMap[],
  bKeymaps: KeyMap[],
  keyName: string | null
) {
  const narrowedResults = aKeymaps
    .map((aKeymap) => {
      const diffResults = bKeymaps.map((bKeymap) =>
        diffKeyMaps(aKeymap, bKeymap, keyName)
      );
      const hasAnyValidTransition = diffResults.some((d) => !d.narrowed);
      // There could be multiple reasons a type does not overlap - we select the one with the least divergence
      return hasAnyValidTransition
        ? null
        : // TODO choose a better heuristic for error version
          diffResults.sort(
            (a, b) => a.narrowedReasons.length - b.narrowedReasons.length
          )[0];
    })
    .filter((r) => r !== null) as UnionDiffResult[];
  const isNarrowed = narrowedResults.length !== 0;
  return {
    isNarrowed,
    reasons: isNarrowed
      ? narrowedResults.map((r) => r.narrowedReasons).flat()
      : [],
  };
}

function areKeymapsExpanded(
  aKeymaps: KeyMap[],
  bKeymaps: KeyMap[],
  keyName: string | null
) {
  const expandedResults = bKeymaps
    .map((bKeymap) => {
      const diffResults = aKeymaps.map((aKeymap) =>
        diffKeyMaps(aKeymap, bKeymap, keyName)
      );
      const hasAnyValidTransition = diffResults.some((d) => !d.expanded);

      // There could be multiple reasons a type does not overlap - we select the one with the least divergence
      return hasAnyValidTransition
        ? null
        : diffResults.sort(
            (a, b) => a.expandedReasons.length - b.expandedReasons.length
          )[0];
    })
    .filter((r) => r !== null) as UnionDiffResult[];
  const isExpanded = expandedResults.length !== 0;
  return {
    isExpanded,
    reasons: isExpanded
      ? expandedResults.map((r) => r.expandedReasons).flat()
      : [],
  };
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

function diffKeyMaps(
  aMap: KeyMap,
  bMap: KeyMap,
  parentKey: string | null
): UnionDiffResult {
  const results: UnionDiffResult = {
    expanded: false,
    expandedReasons: [],
    narrowed: false,
    narrowedReasons: [],
  };
  for (const [key, aValue] of aMap) {
    const bValue = bMap.get(key);
    const keyName = parentKey ? `${parentKey}.${key}` : key;
    if (bValue) {
      if (aValue.keyword === 'type' && bValue.keyword === 'type') {
        const typeTransition = computeTypeTransition(aValue, bValue);
        if (typeTransition.expanded.enum) {
          results.expanded = true;
          results.expandedReasons.push(
            `key ${keyName}: ${typeTransition.expanded.enum}`
          );
        }
        if (typeTransition.expanded.requiredChange) {
          results.expanded = true;
          results.expandedReasons.push(
            `key ${keyName}: ${typeTransition.expanded.requiredChange}`
          );
        }
        if (typeTransition.expanded.typeChange) {
          results.expanded = true;
          results.expandedReasons.push(
            `key ${keyName}: ${typeTransition.expanded.typeChange}`
          );
        }

        if (typeTransition.narrowed.enum) {
          results.narrowed = true;
          results.narrowedReasons.push(
            `key ${keyName}: ${typeTransition.narrowed.enum}`
          );
        }
        if (typeTransition.narrowed.requiredChange) {
          results.narrowed = true;
          results.narrowedReasons.push(
            `key ${keyName}: ${typeTransition.narrowed.requiredChange}`
          );
        }
        if (typeTransition.narrowed.typeChange) {
          results.narrowed = true;
          results.narrowedReasons.push(
            `key ${keyName}: ${typeTransition.narrowed.typeChange}`
          );
        }
      } else {
        const aKeymaps =
          aValue.keyword === 'type'
            ? [
                createKeyMapFromSchema(
                  aValue.schema as FlatOpenAPIV3_1.SchemaObject
                ),
              ]
            : aValue.type;
        const bKeymaps =
          bValue.keyword === 'type'
            ? [
                createKeyMapFromSchema(
                  bValue.schema as FlatOpenAPIV3_1.SchemaObject
                ),
              ]
            : bValue.type;
        const { isNarrowed, reasons: narrowedReasons } = areKeymapsNarrowed(
          aKeymaps,
          bKeymaps,
          keyName
        );
        if (isNarrowed) {
          results.narrowed = true;
          results.narrowedReasons.push(
            `key ${keyName}: ${
              aValue.keyword
            } was narrowed: ${narrowedReasons.join(', ')}`
          );
        }
        const { isExpanded, reasons: expandedReasons } = areKeymapsExpanded(
          aKeymaps,
          bKeymaps,
          keyName
        );
        if (isExpanded) {
          results.expanded = true;
          results.expandedReasons.push(
            `key ${keyName}: ${
              aValue.keyword
            } was expanded: ${expandedReasons.join(', ')}`
          );
        }
      }
    } else if (aValue.required) {
      results.narrowed = true;
      results.narrowedReasons.push(
        `key ${keyName}: required property was removed`
      );
    }
  }

  for (const [key, bValue] of bMap) {
    const keyName = parentKey ? `${parentKey}.${key}` : key;
    if (!aMap.has(key) && bValue.required) {
      results.expandedReasons.push(
        `key ${keyName}: required property was added`
      );
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
): UnionDiffResult {
  const results: UnionDiffResult = {
    narrowed: false,
    narrowedReasons: [],
    expanded: false,
    expandedReasons: [],
  };
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

  const { isNarrowed, reasons: narrowedReasons } = areKeymapsNarrowed(
    beforeMaps,
    afterMaps,
    null
  );
  if (isNarrowed) {
    results.narrowed = true;
    results.narrowedReasons.push(
      `schema was narrowed: ${narrowedReasons.join(', ')}`
    );
  }
  const { isExpanded, reasons: expandedReasons } = areKeymapsExpanded(
    beforeMaps,
    afterMaps,
    null
  );
  if (isExpanded) {
    results.expanded = true;
    results.expandedReasons.push(
      `schema was expanded: ${expandedReasons.join(', ')}`
    );
  }

  return results;
}
