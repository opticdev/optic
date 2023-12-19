import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';

export function prepareOperation(operation: OpenAPIV3.OperationObject) {
  const copied: OpenAPIV3.OperationObject = JSON.parse(
    JSON.stringify(operation)
  );

  removeSchemasFromOperation(copied);
  return copied;
}

function removeSchemasFromOperation(operation: OpenAPIV3.OperationObject) {
  if (operation.requestBody && !('$ref' in operation.requestBody)) {
    for (const value of Object.values(operation.requestBody.content)) {
      value.schema = undefined;
    }
  }

  for (const response of Object.values(operation.responses)) {
    if (!('$ref' in response)) {
      for (const value of Object.values(response.content ?? {})) {
        value.schema = undefined;
      }
    }
  }
}

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

export function prepareResponse(response: OpenAPIV3.ResponseObject) {
  const copied: OpenAPIV3.ResponseObject = JSON.parse(JSON.stringify(response));

  removeExamplesAndDescriptionsFromProperties(copied, []);
  return copied;
}
