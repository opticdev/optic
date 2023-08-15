import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { PatchOperation } from '../../patch-operations';
import JsonPatch from 'fast-json-patch';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { SentryClient } from '../../../../../sentry';
import { logger } from '../../../../../logger';
import { ShapePatch } from './patches';

export type SchemaObject = OpenAPIV3.SchemaObject;

export class Schema {
  static baseFromValue(
    value: any,
    openAPIVersion: SupportedOpenAPIVersions
  ): SchemaObject {
    const rootSchema = initialSchema(value, openAPIVersion);

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
    const operations = JsonPatch.deepClone(
      patch.groupedOperations.flatMap((operation) => operation.operations)
    );
    try {
      const result = JsonPatch.applyPatch(
        schema,
        operations,
        undefined,
        false // don't mutate the original schema
      );

      return result.newDocument!;
    } catch (e) {
      logger.debug({
        location: 'schema',
        error: e,
        operations: JSON.stringify(operations),
        parsed: JSON.stringify(schema),
      });
      SentryClient.captureException(e, {
        extra: {
          operations,
          schema,
        },
      });
      throw e;
    }
  }

  static isPolymorphic(schema: SchemaObject) {
    return !!(schema.allOf || schema.anyOf || schema.oneOf);
  }
}

function initialSchema(
  rootInput: any,
  openAPIVersion: SupportedOpenAPIVersions
): OpenAPIV3.SchemaObject {
  if (rootInput === null) {
    if (openAPIVersion === '3.0.x') return { nullable: true };
    // @ts-ignore we need to retype this as a union of 3 & 3.1
    return { type: 'null' };
  } else if (Array.isArray(rootInput)) {
    return {
      type: 'array',
      items: rootInput.length
        ? initialSchema(rootInput[0], openAPIVersion)
        : {},
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
  'nullable',
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
