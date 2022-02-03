/*
  As we build, extend and patch JSON Schema certain kinds of transitions can leave the JSON Schema in an invalid state
  - for instance, not all keywords are allowed based on `type` (`object` allows `properties`, `array` allows `items`
    going from object -> array means we need to remove some keywords from the schema
    or going from type integer -> type string

  Currently we accommodate these transitions with whitelists for each type, there may be a better solution
 */

import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPatcher } from '../../../patch/incremental-json-patch/json-patcher';

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

/// helper
export function cleanupNewSchema(
  currentSchema: OpenAPIV3.SchemaObject,
  newSchema: OpenAPIV3.SchemaObject
) {
  const patcher = jsonPatcher({ ...currentSchema, ...newSchema });

  let allowedKeys: string[] = [...allowedMetaDataForAll, 'type'];
  if (newSchema.type === 'object') allowedKeys = allowedKeysForObject;
  if (newSchema.type === 'array') allowedKeys = allowedKeysForArray;
  if (newSchema.type === 'string') allowedKeys = allowedKeysForString;
  if (newSchema.type === 'number' || newSchema.type === 'integer')
    allowedKeys = allowedKeysForInteger;
  if (newSchema.oneOf) allowedKeys = allowedKeysForOneOf;

  patcher.helper.removeKeysNotAllowedAt(
    '',
    allowedKeys,
    'after changing to object'
  );

  return patcher.currentDocument();
}
