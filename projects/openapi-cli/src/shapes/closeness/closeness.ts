import { FlatOpenAPIV3, FlatOpenAPIV3_1 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import equals from 'fast-deep-equal';

export function walkSchema(
  schema: FlatOpenAPIV3_1.SchemaObject,
  trail: string = '',
  tuples: [string, any][] = []
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
        tuples
      );
    });
  }

  if (allOf) {
    allOf.forEach((schema) => {
      walkSchema(
        schema,
        // intentionally do not add allOf to trail
        trail,
        tuples
      );
    });
  }

  if (schema.type === 'object')
    tuples.push([
      jsonPointerHelpers.append(trail, 'required'),
      new Set(required || []),
    ]);

  Object.entries(other).forEach(([key, value]) => {
    tuples.push([jsonPointerHelpers.append(trail, key), value]);
  });

  return tuples;
}

export function computeCloseness(
  oneSchema: FlatOpenAPIV3_1.SchemaObject | FlatOpenAPIV3.SchemaObject,
  otherSchema: FlatOpenAPIV3_1.SchemaObject | FlatOpenAPIV3.SchemaObject
): number {
  const a = walkSchema(oneSchema);
  const b = walkSchema(otherSchema);

  const aKeys = new Set(a.map((i) => i[0]));
  const bKeys = new Set(b.map((i) => i[0]));
  const keyIntersection = new Set([...aKeys].filter((i) => bKeys.has(i)));
  const keyUnion = new Set([...aKeys, ...bKeys]);

  const intersectSize = keyIntersection.size;
  const keyUnionSize = keyUnion.size;

  if (keyUnionSize === 0) return 0;

  let matchingIntersectSize = intersectSize;

  keyIntersection.forEach((key) => {
    const aEntries = new Set(
      a.filter((i) => i[0] === key).map((i) => JSON.stringify(i[1]))
    );
    const bEntries = new Set(
      b.filter((i) => i[0] === key).map((i) => JSON.stringify(i[1]))
    );

    const intersection = new Set([...aEntries].filter((i) => bEntries.has(i)));
    const keyUnion = new Set([...aEntries, ...bEntries]);

    const subtract = keyUnion.size ? 1 - intersection.size / keyUnion.size : 0;
    matchingIntersectSize = matchingIntersectSize - subtract;
  });

  return matchingIntersectSize / keyUnionSize;
}
