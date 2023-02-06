import { FlatOpenAPIV3, FlatOpenAPIV3_1 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import equals from 'fast-deep-equal';

export function walkSchema(
  schema: FlatOpenAPIV3_1.SchemaObject,
  trail: string = '',
  map: { [key: string]: any } = {}
) {
  const {
    // special case these
    oneOf,
    allOf,
    anyOf,
    properties,
    required,
    // skip these
    description,
    // other properties
    ...other
  } = schema;

  if (properties) {
    Object.entries(properties).forEach(([key, value]) => {
      walkSchema(
        value,
        jsonPointerHelpers.append(trail, 'properties', key),
        map
      );
    });
  }

  if (schema.type === 'object')
    map[jsonPointerHelpers.append(trail, 'required')] = new Set(required || []);

  Object.entries(other).forEach(([key, value]) => {
    map[jsonPointerHelpers.append(trail, key)] = value;
  });

  return map;
}

export function computeCloseness(
  oneSchema: FlatOpenAPIV3_1.SchemaObject | FlatOpenAPIV3.SchemaObject,
  otherSchema: FlatOpenAPIV3_1.SchemaObject | FlatOpenAPIV3.SchemaObject
): number {
  const a = walkSchema(oneSchema);
  const b = walkSchema(otherSchema);

  const aKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));
  const keyIntersection = new Set([...aKeys].filter((i) => bKeys.has(i)));
  const keyUnion = new Set([...aKeys, ...bKeys]);

  const intersectSize = keyIntersection.size;
  const keyUnionSize = keyUnion.size;

  if (keyUnionSize === 0) return 0;

  let matchingIntersectSize = intersectSize;

  keyIntersection.forEach((key) => {
    if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {
      if (!equals(a[key], b[key])) matchingIntersectSize--;
    }
  });

  return matchingIntersectSize / keyUnionSize;
}
