import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function removeDocumentationFromOperation(
  operation: OpenAPIV3.OperationObject
) {
  const copied: OpenAPIV3.OperationObject = JSON.parse(
    JSON.stringify(operation)
  );

  function walk(value: any, path: string[]) {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, [...path, index.toString()]));
    } else if (typeof value === 'object' && value !== null) {
      if (
        value.hasOwnProperty('description') &&
        jsonPointerHelpers.endsWith(
          jsonPointerHelpers.compile([...path, 'description']),
          ['properties', '**', 'description']
        )
      ) {
        delete value['description'];
      }

      if (
        value.hasOwnProperty('example') &&
        jsonPointerHelpers.endsWith(
          jsonPointerHelpers.compile([...path, 'example']),
          ['properties', '**', 'example']
        )
      ) {
        delete value['example'];
      }

      Object.keys(value).forEach((key) => walk(value[key], [...path, key]));
    } else {
    }
  }

  walk(copied.responses, ['responses']);
  walk(copied.requestBody, ['requestBody']);

  return copied;
}
