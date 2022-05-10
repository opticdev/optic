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
