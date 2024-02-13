import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { FlatOpenAPIV3, OAS3 } from '@useoptic/openapi-utilities';
import { JsonSchemaSourcemap } from '../parser/sourcemap';
import { logPointer } from './pointer';

function mergeAllOf(
  allOf: FlatOpenAPIV3.SchemaObject[],
  sourcemap: JsonSchemaSourcemap | undefined,
  pointers: { old: string; new: string }
) {
  const warnings: string[] = [];
  // Then we should merge this and replace it with an object
  const effectiveObject: FlatOpenAPIV3.NonArraySchemaObject = {
    type: 'object',
    properties: {},
    required: [],
  };
  for (let [index, polymorphicItem] of allOf.entries()) {
    if (polymorphicItem.allOf) {
      const { obj, warnings: w } = mergeAllOf(
        polymorphicItem.allOf,
        sourcemap,
        {
          old: jsonPointerHelpers.append(pointers.old, 'allOf', String(index)),
          new: jsonPointerHelpers.append(pointers.new, 'allOf', String(index)),
        }
      );
      warnings.push(...w);
      polymorphicItem = obj;
    }
    const effectiveProperties = effectiveObject.properties!;
    for (const [key, property] of Object.entries(
      polymorphicItem.properties ?? {}
    )) {
      // For duplicates, choose the first instance of this key
      if (!effectiveProperties[key]) {
        const beforeRequiredIdx =
          polymorphicItem.required?.findIndex((s) => s === key) ?? -1;
        if (beforeRequiredIdx !== -1) {
          const oldRequired = jsonPointerHelpers.append(
            pointers.old,
            'allOf',
            String(index),
            'required',
            String(beforeRequiredIdx)
          );
          const newRequired = jsonPointerHelpers.append(
            pointers.new,
            'required',
            String(effectiveObject.required!.length)
          );
          sourcemap &&
            logPointer(sourcemap, { old: oldRequired, new: newRequired });
          effectiveObject.required!.push(key);
        }
        const oldProperty = jsonPointerHelpers.append(
          pointers.old,
          'allOf',
          String(index),
          'properties',
          key
        );
        const newProperty = jsonPointerHelpers.append(
          pointers.new,
          'properties',
          key
        );
        const w = denormalizeProperty(property, sourcemap, {
          old: oldProperty,
          new: newProperty,
        });
        warnings.push(...w);

        sourcemap &&
          logPointer(sourcemap, { old: oldProperty, new: newProperty });
        effectiveProperties[key] = property;
      }
    }
  }
  if (effectiveObject.required?.length === 0) {
    delete effectiveObject.required;
  }
  return { obj: effectiveObject, warnings };
}

export function denormalizeProperty(
  schema: FlatOpenAPIV3.SchemaObject,
  sourcemap: JsonSchemaSourcemap | undefined,
  pointers: {
    old: string;
    new: string;
  }
) {
  const warnings: string[] = [];
  const polymorphicKey = schema.allOf
    ? 'allOf'
    : schema.anyOf
      ? 'anyOf'
      : schema.oneOf
        ? 'oneOf'
        : null;
  const polymorphicValue = schema.allOf || schema.anyOf || schema.oneOf;
  if (polymorphicKey && polymorphicValue) {
    if (polymorphicKey === 'allOf') {
      let effectiveObject: FlatOpenAPIV3.SchemaObject;
      if (polymorphicValue.length === 1) {
        effectiveObject = polymorphicValue[0];
      } else {
        const objectsAndAllOf = polymorphicValue.filter(
          (schema) => OAS3.isObjectType(schema.type) || schema.allOf
        );
        const invalidChildren = polymorphicValue
          .map((v, i) => [v, i] as const)
          .filter(
            ([schema]) => !(OAS3.isObjectType(schema.type) || schema.allOf)
          );
        const { obj, warnings: w } = mergeAllOf(
          objectsAndAllOf,
          sourcemap,
          pointers
        );
        warnings.push(
          ...invalidChildren.map(
            ([, i]) => `invalid allOf variant at ${pointers.old}/allOf/${i}`
          ),
          ...w
        );
        effectiveObject = obj;
      }
      for (const [key, value] of Object.entries(effectiveObject)) {
        (schema as any)[key] = value;
      }
      delete schema[polymorphicKey];
    } else {
      for (const [index, polymorphicItem] of polymorphicValue.entries()) {
        const w = denormalizeProperty(polymorphicItem, sourcemap, {
          old: jsonPointerHelpers.append(
            pointers.old,
            polymorphicKey,
            String(index)
          ),
          new: jsonPointerHelpers.append(
            pointers.new,
            polymorphicKey,
            String(index)
          ),
        });
        warnings.push(...w);
      }
    }
  } else {
    if (OAS3.isArrayType(schema.type) && (schema as any).items) {
      const w = denormalizeProperty((schema as any).items, sourcemap, {
        old: jsonPointerHelpers.append(pointers.old, 'items'),
        new: jsonPointerHelpers.append(pointers.new, 'items'),
      });
      warnings.push(...w);
    }
    if (OAS3.isObjectType(schema.type)) {
      const properties = schema.properties ?? {};
      for (const [key, property] of Object.entries(properties)) {
        const w = denormalizeProperty(property, sourcemap, {
          old: jsonPointerHelpers.append(pointers.old, 'properties', key),
          new: jsonPointerHelpers.append(pointers.new, 'properties', key),
        });
        warnings.push(...w);
      }
    }
  }
  // else we stop here
  return warnings;
}
