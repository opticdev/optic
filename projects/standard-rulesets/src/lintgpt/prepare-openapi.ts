import { OpenAPIV3 } from 'openapi-types';

export function prepareOperation(operation: OpenAPIV3.OperationObject) {
  const copied: OpenAPIV3.OperationObject = JSON.parse(
    JSON.stringify(operation)
  );

  removeSchemasFromOperation(copied);
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

export function prepareResponse(response: OpenAPIV3.ResponseObject) {
  const copied: OpenAPIV3.ResponseObject = JSON.parse(JSON.stringify(response));

  for (const value of Object.values(copied.content ?? {})) {
    value.schema = undefined;
  }
  return copied;
}
