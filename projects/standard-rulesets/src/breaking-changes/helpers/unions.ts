import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  FlatOpenAPIV3_1,
  OpenAPIV3,
  OpenAPIV3_1,
  OpenApi3SchemaFact,
} from '@useoptic/openapi-utilities';
import { computeTypeTransition } from './type-change';

const SEPARATOR = '/';

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
  request: boolean;
  requestReasons: { key: string; reason: string }[];
  response: boolean;
  responseReasons: { key: string; reason: string }[];
};

function getDeepestDiffLevel(reasons: { key: string }[]): number {
  let max = 0;
  for (const { key } of reasons) {
    const keyLength = key === SEPARATOR ? 0 : key.split(SEPARATOR).length;
    max = Math.max(max, keyLength);
  }

  return max;
}

function compareReasons(
  a: { key: string; reason: string }[],
  b: { key: string; reason: string }[]
): number {
  const aDiffLevel = getDeepestDiffLevel(a);
  const bDiffLevel = getDeepestDiffLevel(b);
  if (aDiffLevel === bDiffLevel) {
    return a.length - b.length;
  } else {
    return bDiffLevel - aDiffLevel;
  }
}

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

function areKeymapsResponseBreaking(
  aKeymaps: KeyMap[],
  bKeymaps: KeyMap[],
  keyName: string,
  keyword: string | null
) {
  const responseResults = aKeymaps
    .map((aKeymap, i) => {
      const key = keyword
        ? keyName === '/'
          ? `${keyword}/${i}`
          : `${keyword}/${keyName}/${i}`
        : keyName;
      const diffResults = bKeymaps.map((bKeymap) =>
        diffKeyMaps(aKeymap, bKeymap, key)
      );
      const hasAnyValidTransition = diffResults.some((d) => !d.response);
      // There could be multiple reasons a type does not overlap - we select the one that we think is the most relevant,
      // in this case, this is a diff at the deepest level
      return hasAnyValidTransition
        ? null
        : diffResults.sort((a, b) =>
            compareReasons(a.responseReasons, b.responseReasons)
          )[0];
    })
    .filter((r) => r !== null) as UnionDiffResult[];
  const isResponse = responseResults.length !== 0;
  return {
    isResponse,
    reasons: isResponse
      ? responseResults.sort((a, b) =>
          compareReasons(a.responseReasons, b.responseReasons)
        )[0].responseReasons
      : [],
  };
}

function areKeymapsRequestBreaking(
  aKeymaps: KeyMap[],
  bKeymaps: KeyMap[],
  keyName: string,
  keyword: string | null
) {
  const requestResults = bKeymaps
    .map((bKeymap, i) => {
      const key = keyword
        ? keyName === '/'
          ? `${keyword}/${i}`
          : `${keyword}/${keyName}/${i}`
        : keyName;
      const diffResults = aKeymaps.map((aKeymap) =>
        diffKeyMaps(aKeymap, bKeymap, key)
      );
      const hasAnyValidTransition = diffResults.some((d) => !d.request);

      // There could be multiple reasons a type does not overlap - we select the one that we think is the most relevant,
      // in this case, this is a diff at the deepest level
      return hasAnyValidTransition
        ? null
        : diffResults.sort((a, b) =>
            compareReasons(a.requestReasons, b.requestReasons)
          )[0];
    })
    .filter((r) => r !== null) as UnionDiffResult[];
  const isRequestBreaking = requestResults.length !== 0;
  return {
    isRequestBreaking,
    reasons: isRequestBreaking
      ? requestResults.sort((a, b) =>
          compareReasons(a.requestReasons, b.requestReasons)
        )[0].requestReasons
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
          const fullKey = path ? `${path}${SEPARATOR}${key}` : key;
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
  parentKey: string
): UnionDiffResult {
  const results: UnionDiffResult = {
    request: false,
    requestReasons: [],
    response: false,
    responseReasons: [],
  };
  for (const [key, aValue] of aMap) {
    const bValue = bMap.get(key);
    const keyName =
      key === ''
        ? parentKey
        : parentKey === '/'
        ? `${parentKey}${key}`
        : `${parentKey}${SEPARATOR}${key}`;
    const prefix = keyName ? `${keyName}: ` : '';
    if (bValue) {
      if (aValue.keyword === 'type' && bValue.keyword === 'type') {
        const typeTransition = computeTypeTransition(aValue, bValue);
        if (typeTransition.request.enum) {
          results.request = true;
          results.requestReasons.push({
            key: keyName,
            reason: `${prefix}${typeTransition.request.enum}`,
          });
        }
        if (typeTransition.request.requiredChange) {
          results.request = true;
          results.requestReasons.push({
            key: keyName,
            reason: `${prefix}${typeTransition.request.requiredChange}`,
          });
        }
        if (typeTransition.request.typeChange) {
          results.request = true;
          results.requestReasons.push({
            key: keyName,
            reason: `${prefix}${typeTransition.request.typeChange}`,
          });
        }

        if (typeTransition.response.enum) {
          results.response = true;
          results.responseReasons.push({
            key: keyName,
            reason: `${prefix}${typeTransition.response.enum}`,
          });
        }
        if (typeTransition.response.requiredChange) {
          results.response = true;
          results.responseReasons.push({
            key: keyName,
            reason: `${prefix}${typeTransition.response.requiredChange}`,
          });
        }
        if (typeTransition.response.typeChange) {
          results.response = true;
          results.responseReasons.push({
            key: keyName,
            reason: `${prefix}${typeTransition.response.typeChange}`,
          });
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
        const responseKeyword =
          aValue.keyword === 'anyOf' || aValue.keyword === 'oneOf'
            ? aValue.keyword
            : null;
        const { isResponse, reasons: responseReasons } =
          areKeymapsResponseBreaking(
            aKeymaps,
            bKeymaps,
            keyName,
            responseKeyword
          );
        if (isResponse) {
          results.response = true;
          results.responseReasons.push({
            key: keyName,
            reason: `${prefix}${aValue.keyword}: ${responseReasons
              .map((r) => r.reason)
              .join(', ')}`,
          });
        }
        const requestKeyword =
          bValue.keyword === 'anyOf' || bValue.keyword === 'oneOf'
            ? bValue.keyword
            : null;
        const { isRequestBreaking, reasons: requestReasons } =
          areKeymapsRequestBreaking(
            aKeymaps,
            bKeymaps,
            keyName,
            requestKeyword
          );
        if (isRequestBreaking) {
          results.request = true;
          results.requestReasons.push({
            key: keyName,
            reason: `${prefix}${aValue.keyword}: ${requestReasons
              .map((r) => r.reason)
              .join(', ')}`,
          });
        }
      }
    } else if (aValue.required) {
      results.response = true;
      results.responseReasons.push({
        key: keyName,
        reason: `${prefix}required property was removed`,
      });
    }
  }

  for (const [key, bValue] of bMap) {
    const keyName =
      key === ''
        ? parentKey
        : parentKey === '/'
        ? `${parentKey}${key}`
        : `${parentKey}${SEPARATOR}${key}`;
    const prefix = keyName ? `${keyName}: ` : '';
    if (!aMap.has(key) && bValue.required) {
      results.requestReasons.push({
        key: keyName,
        reason: `${prefix}required property was added`,
      });
      results.request = true;
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
    response: false,
    responseReasons: [],
    request: false,
    requestReasons: [],
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
  const beforeKeyword = b.oneOf ? 'oneOf' : b.anyOf ? 'anyOf' : null;
  const afterMaps = a.oneOf
    ? a.oneOf.map((s) => createKeyMapFromSchema(s))
    : a.anyOf
    ? a.anyOf.map((s) => createKeyMapFromSchema(s))
    : Array.isArray(a.type)
    ? traverseTypeArraySchemas(a)
    : [createKeyMapFromSchema(a)];
  const afterKeyword = a.oneOf ? 'oneOf' : a.anyOf ? 'anyOf' : null;

  const { isResponse, reasons: responseReasons } = areKeymapsResponseBreaking(
    beforeMaps,
    afterMaps,
    '/',
    beforeKeyword
  );
  if (isResponse) {
    results.response = true;
    results.responseReasons.push({
      key: 'root',
      reason: `${responseReasons.map((r) => r.reason).join(', ')}`,
    });
  }
  const { isRequestBreaking, reasons: expandedReasons } =
    areKeymapsRequestBreaking(beforeMaps, afterMaps, '/', afterKeyword);
  if (isRequestBreaking) {
    results.request = true;
    results.requestReasons.push({
      key: 'root',
      reason: `${expandedReasons.map((r) => r.reason).join(', ')}`,
    });
  }

  return results;
}
