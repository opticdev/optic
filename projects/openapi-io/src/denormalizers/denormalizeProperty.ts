import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { FlatOpenAPIV3, OAS3 } from '@useoptic/openapi-utilities';
import { JsonSchemaSourcemap } from '../parser/sourcemap';
import { logPointer } from './pointer';

function mergeAllOf(
  allOf: FlatOpenAPIV3.SchemaObject[],
  sourcemap: JsonSchemaSourcemap | undefined,
  pointers: { old: string; new: string }
) {
  // Then we should merge this and replace it with an object
  const effectiveObject: FlatOpenAPIV3.NonArraySchemaObject = {
    type: 'object',
    properties: {},
    required: [],
  };
  for (let [index, polymorphicItem] of allOf.entries()) {
    if (polymorphicItem.allOf) {
      polymorphicItem = mergeAllOf(polymorphicItem.allOf, sourcemap, {
        old: jsonPointerHelpers.append(pointers.old, 'allOf', String(index)),
        new: jsonPointerHelpers.append(pointers.new, 'allOf', String(index)),
      });
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
        denormalizeProperty(property, sourcemap, {
          old: oldProperty,
          new: newProperty,
        });

        sourcemap &&
          logPointer(sourcemap, { old: oldProperty, new: newProperty });
        effectiveProperties[key] = property;
      }
    }
  }
  if (effectiveObject.required?.length === 0) {
    delete effectiveObject.required;
  }
  return effectiveObject;
}

export function denormalizeProperty(
  schema: FlatOpenAPIV3.SchemaObject,
  sourcemap: JsonSchemaSourcemap | undefined,
  pointers: {
    old: string;
    new: string;
  }
) {
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
      const objectsAndAllOf = polymorphicValue.filter(
        (schema) => OAS3.isObjectType(schema.type) || schema.allOf
      );
      const effectiveObject = mergeAllOf(objectsAndAllOf, sourcemap, pointers);
      schema.type = effectiveObject.type;
      schema.properties = effectiveObject.properties;
      schema.required = effectiveObject.required;
      delete schema[polymorphicKey];
    } else {
      for (const [index, polymorphicItem] of polymorphicValue.entries()) {
        denormalizeProperty(polymorphicItem, sourcemap, {
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
      }
    }
  } else {
    if (OAS3.isArrayType(schema.type) && (schema as any).items) {
      denormalizeProperty((schema as any).items, sourcemap, {
        old: jsonPointerHelpers.append(pointers.old, 'items'),
        new: jsonPointerHelpers.append(pointers.new, 'items'),
      });
    }
    if (OAS3.isObjectType(schema.type)) {
      const properties = schema.properties ?? {};
      for (const [key, property] of Object.entries(properties)) {
        denormalizeProperty(property, sourcemap, {
          old: jsonPointerHelpers.append(pointers.old, 'properties', key),
          new: jsonPointerHelpers.append(pointers.new, 'properties', key),
        });
      }
    }
  }
  // else we stop here
}
