import { jsonPointerHelpers as jsonPointer } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';

export const normalizeOpenApiPath = (path: string) => {
  return path
    .split('/')
    .map((pathComponent) => {
      if (pathComponent.startsWith('{') && pathComponent.endsWith('}')) {
        return '{}';
      }
      return pathComponent;
    })
    .join('/');
};

export const getReadableLocation = (jsonPath: string): string =>
  jsonPointer.decode(jsonPath).join(' > ');

export const isNotReferenceObject = <T extends {}>(
  maybeReference: T | OpenAPIV3.ReferenceObject
): maybeReference is Exclude<T, OpenAPIV3.ReferenceObject> => {
  return !('$ref' in maybeReference);
};

export const isObject = (value: any) => {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
};
