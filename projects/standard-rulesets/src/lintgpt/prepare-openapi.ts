import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

function removeExamplesAndDescriptionsFromProperties(
  value: any,
  path: string[]
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      removeExamplesAndDescriptionsFromProperties(item, [
        ...path,
        index.toString(),
      ])
    );
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

    if (
      value.hasOwnProperty('examples') &&
      jsonPointerHelpers.endsWith(
        jsonPointerHelpers.compile([...path, 'examples']),
        ['properties', '**', 'examples']
      )
    ) {
      delete value['examples'];
    }

    Object.keys(value).forEach((key) =>
      removeExamplesAndDescriptionsFromProperties(value[key], [...path, key])
    );
  } else {
  }
}

export function removeDocumentationFromOperation(
  operation: OpenAPIV3.OperationObject
) {
  const copied: OpenAPIV3.OperationObject = JSON.parse(
    JSON.stringify(operation)
  );

  removeExamplesAndDescriptionsFromProperties(copied.responses, ['responses']);
  removeExamplesAndDescriptionsFromProperties(copied.requestBody, [
    'requestBody',
  ]);

  return copied;
}

export function removeDocumentationFromResponses(
  response: OpenAPIV3.ResponseObject
) {
  const copied: OpenAPIV3.ResponseObject = JSON.parse(JSON.stringify(response));

  removeExamplesAndDescriptionsFromProperties(copied, []);

  return copied;
}
