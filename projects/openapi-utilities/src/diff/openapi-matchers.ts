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

/*
Checks if a schema is an allOf with every child as an object. If this is true, we can diff it as-if it is an object
 */
export const isAnObjectAllOf = (pointer: string, schema: any) => {
  return (
    inJsonSchema(pointer) &&
    Array.isArray(schema.allOf) &&
    schema.allOf.length &&
    schema.allOf.every(
      (childSchema: any) =>
        childSchema.type === 'object' ||
        (Array.isArray(childSchema.type) &&
          childSchema.type.length === 1 &&
          childSchema.type[0] === 'object')
    )
  );
};

/*
Checks if a schema is an object
 */
export const isAnObject = (pointer: string, schema: any) => {
  return (
    (inJsonSchema(pointer) &&
      !schema.allOf &&
      schema.type &&
      schema.type === 'object') ||
    (Array.isArray(schema.type) &&
      schema.type.length === 1 &&
      schema.type[0] === 'object')
  );
};

/*
Checks for the 3 possible allOf diffs
- was an object before, now it's an allOf object
- was an allOf object before, now it's an object
- two allOf objects
 */
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

/*
Finds all the properties (unique by name) across all the schemas in an allOf.
- If the properties overlap the last in the tree wins
- The property will be required if its parent object has required to be specified
 */
export const propertiesForAllOf = (allOfOrObject: {
  path: string;
  value: JSONObject | JSONArray;
  // key  schema path is required  path of required entry (explicitly required) or null (implicitly option)
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

/*
Walks each of the schemas from before / after
- computes next comparisons to diff
- manually diffs the required arrays. There are (n) possible required arrays (one in each schema) so we need alternative logic here
 */
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

    // if the property became optional, return the correct diff
    if (beforeIsRequired && !afterIsRequired && beforeRequiredPath) {
      requiredDiffResults.push({
        before: beforeRequiredPath,
        pathReconciliation: [],
      });
    }
    // became required, return the correct diff
    if (afterIsRequired && !beforeIsRequired && afterRequiredPath) {
      requiredDiffResults.push({
        after: afterRequiredPath,
      });
    }
  }

  /* when both are allOf we can compare the other properties of the object, like summary, description, etc.
     We ignore these during the transition from object to allOf because it creates conflict and they probably need to refactor anyway. For instance title...what does it mean for all of the sub schemas to have a title? not last one wins, you probably want the title to be compared to the title next to allOf: []

   */
  if (
    isAnObjectAllOf(before.path, before.value) &&
    isAnObjectAllOf(after.path, after.value)
  ) {
    const beforeAllOfSchemas =
      (before.value as unknown as FlatOpenAPIV3.SchemaObject).allOf || [];
    const afterAllOfSchemas =
      (after.value as unknown as FlatOpenAPIV3.SchemaObject).allOf || [];

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
