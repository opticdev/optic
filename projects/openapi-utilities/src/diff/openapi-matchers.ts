import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getParameterIdentity } from './array-identifiers';
import { FlatOpenAPIV3 } from '../flat-openapi-types';
import { JSONArray, JSONObject, JSONValue, ObjectDiff } from './diff';

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

export const isAnObjectAllOf = (pointer: string, schema: any) => {
  return (
    inJsonSchema(pointer) &&
    Array.isArray(schema.allOf) &&
    schema.allOf.length &&
    schema.allOf.every((childSchema: any) => childSchema.type === 'object')
  );
};

export const isAnObject = (pointer: string, schema: any) => {
  return (
    inJsonSchema(pointer) &&
    !schema.allOf &&
    schema.type &&
    schema.type === 'object'
  );
};

export const isAllOfDiff = (
  before: { path: string; value: JSONObject | JSONArray },
  after: { path: string; value: JSONObject | JSONArray }
) => {
  return (
    (isAnObjectAllOf(before.path, before.value) &&
      isAnObjectAllOf(after.path, after.value)) ||
    (isAnObjectAllOf(before.path, before.value) &&
      isAnObject(after.path, after.value)) ||
    (isAnObject(before.path, before.value) &&
      isAnObjectAllOf(after.path, after.value))
  );
};

export const propertiesForAllOf = (allOfOrObject: {
  path: string;
  value: JSONObject | JSONArray;
}): Map<string, [any, string, boolean, string | null]> => {
  let keyPathMap = new Map<string, [any, string, boolean, string | null]>();

  if (isAnObject(allOfOrObject.path, allOfOrObject.value)) {
    const obj = allOfOrObject.value as unknown as FlatOpenAPIV3.SchemaObject & {
      type: 'object';
    };
    Object.keys(obj.properties || {}).forEach((prop) => {
      const isRequired: boolean = obj.required
        ? obj.required.includes(prop)
        : false;
      keyPathMap.set(prop, [
        obj.properties![prop],
        jsonPointerHelpers.append(allOfOrObject.path, 'properties', prop),
        isRequired,
        isRequired
          ? jsonPointerHelpers.append(
              allOfOrObject.path,
              'required',
              String(obj.required?.indexOf(prop))
            )
          : null,
      ]);
    });
  } else if (isAnObjectAllOf(allOfOrObject.path, allOfOrObject.value)) {
    const allOf = allOfOrObject.value as unknown as FlatOpenAPIV3.SchemaObject;
    (allOf.allOf || []).forEach((schema, index) => {
      keyPathMap = new Map([
        ...keyPathMap,
        ...propertiesForAllOf({
          value: schema as any,
          path: jsonPointerHelpers.append(
            allOfOrObject.path,
            'allOf',
            String(index)
          ),
        }),
      ]);
    });
  }

  return keyPathMap;
};
export const comparisonsForAllOf = (
  before: { path: string; value: JSONObject | JSONArray },
  after: { path: string; value: JSONObject | JSONArray }
) => {
  const beforeProperties = propertiesForAllOf(before);
  const afterProperties = propertiesForAllOf(after);

  const propertyKeys = new Set([
    ...beforeProperties.keys(),
    ...afterProperties.keys(),
  ]);

  const comparisons: {
    beforeValue: JSONValue | undefined;
    beforePath: string;
    afterValue: JSONValue | undefined;
    afterPath: string;
  }[] = [];

  const requiredDiffResults: ObjectDiff[] = [];

  for (const key of propertyKeys) {
    const [beforeValue, beforePath, beforeIsRequired, beforeRequiredPath] =
      beforeProperties.get(key) ?? [];
    const [afterValue, afterPath, afterIsRequired, afterRequiredPath] =
      afterProperties.get(key) ?? [];

    comparisons.push({
      beforeValue,
      beforePath: (beforePath || afterPath)!,
      afterPath: (afterPath || beforePath)!,
      afterValue,
    });

    // became optional
    if (beforeIsRequired && !afterIsRequired && beforeRequiredPath) {
      requiredDiffResults.push({
        before: beforeRequiredPath,
        pathReconciliation: [],
      });
    }
    // became required
    if (afterIsRequired && !beforeIsRequired && afterRequiredPath) {
      requiredDiffResults.push({
        after: afterRequiredPath,
      });
    }
  }

  if (
    isAnObjectAllOf(before.path, before.value) &&
    isAnObjectAllOf(after.path, after.value)
  ) {
    const beforeAllOfSchemas =
      (before.value as unknown as FlatOpenAPIV3.SchemaObject).allOf || [];
    const afterAllOfSchemas =
      (after.value as unknown as FlatOpenAPIV3.SchemaObject).allOf || [];

    Math.max(beforeAllOfSchemas.length, afterAllOfSchemas.length);

    const withoutProperties = (obj: FlatOpenAPIV3.SchemaObject | undefined) => {
      if (obj) {
        const { properties, required, ...others } = obj;
        return others;
      } else {
        return undefined;
      }
    };

    Array(Math.max(beforeAllOfSchemas.length, afterAllOfSchemas.length))
      .fill(undefined)
      .forEach((_, index) => {
        const beforeVal = beforeAllOfSchemas[index];
        const afterVal = afterAllOfSchemas[index];
        comparisons.push({
          beforeValue: withoutProperties(beforeVal) as JSONObject,
          afterValue: withoutProperties(afterVal) as JSONObject,
          beforePath: jsonPointerHelpers.append(
            before.path,
            'allOf',
            String(index)
          ),
          afterPath: jsonPointerHelpers.append(
            after.path,
            'allOf',
            String(index)
          ),
        });
      });
  }

  return { comparisons, requiredDiffResults };
};
