import { OpenAPIV3 } from '../specs/index';
import { diffValueBySchema } from './diffs';
import { ShapeDiffResult, ShapeDiffResultKind } from './diffs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Operation } from './patches';
import equals from 'fast-deep-equal';

export type SchemaObject = OpenAPIV3.SchemaObject;

export class Schema {
  static fromValue(value: any): SchemaObject {
    const rootSchema = initialSchema(value);

    console.warn(
      'TODO: generate entire json schema for example from shape diff, not just initial type'
    );

    let schema = rootSchema;
    let diffs = [...diffValueBySchema(value, rootSchema)];
    let currentExample = value;

    // keep extending schema until we hit zero diffs
    // while (diffs.length > 0 || currentExample) {}

    return schema;
  }

  static clone(value: SchemaObject): SchemaObject {
    return JSON.parse(JSON.stringify(value));
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
    currentSchema: SchemaObject,
    newSchema: SchemaObject
  ): IterableIterator<Operation> {
    const merged = { ...currentSchema, ...newSchema };
    const currrentKeys = new Set(Object.keys(currentSchema));

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
      } else if (!currrentKeys.has(key)) {
        yield {
          op: 'add',
          path,
          value,
        };
      } else if (value !== currentSchema[value]) {
        yield {
          op: 'replace',
          path,
          value,
        };
      }
    }
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
