import { CapturedInteraction } from '../../captures';
import { DocumentedInteraction, Operation } from '..';
import { OperationDiffResult } from './result';
import { OpenAPIV3 } from '../../specs';
import invariant from 'ts-invariant';

import { visitRequestBody, visitResponses } from './visitors';
import { stringify } from 'querystring';

export class OperationDiffTraverser {
  private interaction?: CapturedInteraction;
  private operation?: Operation;

  traverse(interaction, operation) {
    this.interaction = interaction;
    this.operation = operation;
  }

  *results(): IterableIterator<OperationDiffResult> {
    if (!this.interaction || !this.operation) return;

    const { operation, interaction } = this;

    const requestBody = operation.requestBody;
    invariant(
      !requestBody || isNotReferenceObject(requestBody),
      `operation expected to not have any references, found in request body, pathPattern=${operation.pathPattern} method=${operation.method}`
    );
    yield* visitRequestBody(interaction, requestBody);

    const responses = Object.fromEntries(
      Object.entries(operation.responses).map(([code, response]) => {
        invariant(
          isNotReferenceObject(response),
          `operation expected to not have any reference, found in response, statusCode=${code} pathPattern=${operation.pathPattern} method=${operation.method}`
        );
        return [code, response];
      })
    );
    yield* visitResponses(interaction, responses);
  }
}

const isNotReferenceObject = <T extends {}>(
  maybeReference: T | OpenAPIV3.ReferenceObject
): maybeReference is Exclude<T, OpenAPIV3.ReferenceObject> => {
  return !('$ref' in maybeReference);
};
