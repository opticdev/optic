import { OpenAPIV3 } from '../specs/index';
import { ShapePatch } from './patches';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { PatchOperation } from '../patches';
import JsonPatch from 'fast-json-patch';
import { OperationPatch } from '../operations';

export type SchemaObject = OpenAPIV3.SchemaObject;

export class Schema {
  static baseFromValue(value: any): SchemaObject {
    const rootSchema = initialSchema(value);

    let schema = rootSchema;

    return schema;
  }

  static clone(value: SchemaObject): SchemaObject {
    return JsonPatch.deepClone(value);
  }

  static equals(a: SchemaObject, b: SchemaObject): boolean {
    return !!Schema.mergeOperations(a, b).next().done;
  }

  static merge(
    currentSchema: SchemaObject,
    newSchema: SchemaObject
  ): SchemaObject {
    const merged = { ...currentSchema, ...newSchema };

    let allowedKeys: string[] = [...allowedMetaDataForAll, 'type'];
    if (newSchema.type === 'object') allowedKeys = allowedKeysForObject;
    if (newSchema.type === 'array') allowedKeys = allowedKeysForArray;
    if (newSchema.type === 'string') allowedKeys = allowedKeysForString;
    if (newSchema.type === 'number' || newSchema.type === 'integer')
      allowedKeys = allowedKeysForInteger;
    if (newSchema.oneOf) allowedKeys = allowedKeysForOneOf;

    for (let key in merged) {
      if (!allowedKeys.includes(key) || isExtension(key)) {
        delete merged[key];
      }
    }

    return merged;
  }

  static *mergeOperations(
    currentSchema: SchemaObject | null,
    newSchema: SchemaObject
  ): IterableIterator<PatchOperation> {
    if (currentSchema === null) {
      yield {
        op: 'add',
        path: '',
        value: {},
      };
      currentSchema = {};
    }

    const merged = { ...currentSchema, ...newSchema };
    const currentKeys = new Set(Object.keys(currentSchema));

    let allowedKeys: string[] = [...allowedMetaDataForAll, 'type'];
    if (newSchema.type === 'object') allowedKeys = allowedKeysForObject;
    if (newSchema.type === 'array') allowedKeys = allowedKeysForArray;
    if (newSchema.type === 'string') allowedKeys = allowedKeysForString;
    if (newSchema.type === 'number' || newSchema.type === 'integer')
      allowedKeys = allowedKeysForInteger;
    if (newSchema.oneOf) allowedKeys = allowedKeysForOneOf;

    for (let [key, value] of Object.entries(merged)) {
      let path = jsonPointerHelpers.append('', key);

      if (!allowedKeys.includes(key) || isExtension(key)) {
        yield {
          op: 'remove',
          path,
        };
      } else if (!currentKeys.has(key)) {
        yield {
          op: 'add',
          path,
          value,
        };
      } else if (value !== currentSchema[key]) {
        yield {
          op: 'replace',
          path,
          value,
        };
      }
    }
  }

  static applyShapePatch(
    schema: SchemaObject | null,
    patch: ShapePatch
  ): SchemaObject {
    const result = JsonPatch.applyPatch(
      schema,
      JsonPatch.deepClone([...OperationPatch.operations(patch)]),
      undefined,
      false // don't mutate the original schema
    );

    return result.newDocument!;
  }

  static isPolymorphic(schema: SchemaObject) {
    for (let key of Object.keys(schema)) {
      if (!allowedKeysForOneOf.includes(key) && !isExtension(key)) {
        return false;
      }
    }
    return true;
  }
}

function initialSchema(rootInput: any): OpenAPIV3.SchemaObject {
  if (rootInput === null) {
    // @ts-ignore, this is ok now.
    return { type: 'null' };
  } else if (Array.isArray(rootInput)) {
    return {
      type: 'array',
      items: rootInput.length ? initialSchema(rootInput[0]) : {},
    };
  } else if (typeof rootInput === 'object') {
    return { type: 'object' };
  } else if (typeof rootInput === 'string') {
    return { type: 'string' };
  } else if (typeof rootInput === 'number') {
    return { type: 'number' };
  } else if (typeof rootInput === 'boolean') {
    return { type: 'boolean' };
  } else {
    throw new Error('Could not learn JSON Schema');
  }
}

export const allowedMetaDataForAll: string[] = [
  'title',
  'description',
  'example',
  'examples',
  'default',
  'deprecated',
  'externalDocs',
];

export const allowedKeysForOneOf: string[] = [
  ...allowedMetaDataForAll,
  'oneOf',
  'allOf',
  'not',
  'discriminator',
];

export const allowedKeysForObject: string[] = [
  ...allowedMetaDataForAll,
  'additionalProperties',
  'type',
  'maxProperties',
  'minProperties',
  'required',
  'properties',
];
export const allowedKeysForArray: string[] = [
  ...allowedMetaDataForAll,
  'type',
  'items',
  'maxItems',
  'minItems',
  'uniqueItems',
];

export const allowedKeysForString: string[] = [
  ...allowedMetaDataForAll,
  'type',
  'format',
  'pattern',
  'maxLength',
  'minLength',
];

export const allowedKeysForInteger: string[] = [
  ...allowedMetaDataForAll,
  'type',
  'minimum',
  'maximum',
  'multipleOf',
];

export const isExtension = (key: string) => key.startsWith('x-');
