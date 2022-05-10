import { CapturedInteraction } from '../captures';
import { OpenAPIV3 } from '../specs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import invariant from 'ts-invariant';

export { DocumentedInteractions } from './streams/documented-interactions';
export { OperationPatches } from './streams/patches';
export { OperationPatch } from './patches';

export interface Operation extends OpenAPIV3.OperationObject {
  pathPattern: string;
  method: OpenAPIV3.HttpMethods;

  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: { [code: string]: OpenAPIV3.ResponseObject };
}

export class Operation {
  static fromOperationObject(
    pathPattern: string,
    method: OpenAPIV3.HttpMethods,
    operation: OpenAPIV3.OperationObject
  ): Operation {
    const requestBody = operation.requestBody;
    invariant(
      !requestBody || isNotReferenceObject(requestBody),
      `operation expected to not have any references, found in request body, pathPattern=${pathPattern} method=${method}`
    );

    const responses = Object.fromEntries(
      Object.entries(operation.responses).map(([code, response]) => {
        invariant(
          isNotReferenceObject(response),
          `operation expected to not have any reference, found in response, statusCode=${code} pathPattern=${pathPattern} method=${method}`
        );
        return [code, response];
      })
    );

    return {
      pathPattern,
      method,
      ...operation,
      requestBody,
      responses,
    };
  }
}

export interface DocumentedInteraction {
  interaction: CapturedInteraction;
  operation: Operation;
  specJsonPath: string;
}

const HttpMethods = OpenAPIV3.HttpMethods;
export { HttpMethods };

export function findResponse(
  { responses }: Pick<Operation, 'responses'>,
  statusCode: string
): [OpenAPIV3.ResponseObject, string] | null {
  let exactMatch: [OpenAPIV3.ResponseObject, string] | null = null;
  let rangeMatch: [OpenAPIV3.ResponseObject, string] | null = null;
  let defaultMatch: [OpenAPIV3.ResponseObject, string] | null = null;

  // oldskool for loop, because no object.find and work arounds are messy
  for (let [code, response] of Object.entries(responses)) {
    if (code === statusCode) {
      exactMatch = [response, code];
      break; // exact match found, so we can stop looking
    }

    if (
      !rangeMatch &&
      statusRangePattern.test(statusCode) &&
      statusCode.substring(0, 1) === code.substring(0, 1)
    ) {
      rangeMatch = [response, code];
      continue;
    }

    if (!defaultMatch && code === 'default') {
      defaultMatch = [response, code];
    }

    if (exactMatch && rangeMatch && defaultMatch) break;
  }

  return exactMatch || rangeMatch || defaultMatch;
}

const statusRangePattern = /[245]xx/;

const isNotReferenceObject = <T extends {}>(
  maybeReference: T | OpenAPIV3.ReferenceObject
): maybeReference is Exclude<T, OpenAPIV3.ReferenceObject> => {
  return !('$ref' in maybeReference);
};
