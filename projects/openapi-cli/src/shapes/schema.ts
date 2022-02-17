import { OpenAPIV3 } from '../specs/index';
import { diffBodyBySchema } from '.';
import { ShapeDiffResult, ShapeDiffResultKind } from './diffs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export type SchemaObject = OpenAPIV3.SchemaObject;

export class Schema {
  static fromValue(value: any): SchemaObject {
    const root = initialSchema(value);

    console.warn(
      'TODO: generate entire json schema for example from shape diff, not just initial type'
    );

    return root;
  }

  static merge(
    currentSchema: SchemaObject,
    newSchema: SchemaObject
  ): SchemaObject {
    const merged = { ...currentSchema, ...newSchema };

    if (currentSchema.type !== newSchema.type) {
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
    }

    return merged;
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
