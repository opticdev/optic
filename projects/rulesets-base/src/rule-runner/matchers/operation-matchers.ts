import { RuleError } from '../../errors';
import { AssertionTypeToHelpers } from '../../types';
import { CallableAssertion } from '../rule-runner-types';
import { valuesMatcher } from './utils';

export const createOperationHelpers = (
  addAssertion: (
    condition: string,
    assertion: CallableAssertion<'operation'>
  ) => void
): AssertionTypeToHelpers['operation'] => {
  return {
    matches: (
      reference: any,
      options: {
        strict?: boolean;
      } = {}
    ) => {
      addAssertion('match expected shape', (value) => {
        const { strict = false } = options;
        if (!valuesMatcher(reference, value.raw, strict)) {
          throw new RuleError({
            message: strict
              ? 'Expected an exact match'
              : 'Expected a partial match',
            received: value.raw,
            expected: reference,
          });
        }
      });
    },
    hasQueryParameterMatching: (
      parameterShape: any,
      options: {
        strict?: boolean;
      } = {}
    ) => {
      const { strict = false } = options;

      addAssertion('have parameter matching shape', (operation) => {
        const parameterMatchingShape = [
          ...operation.queryParameters.values(),
        ].find((queryParameter) =>
          valuesMatcher(parameterShape, queryParameter.raw, strict)
        );
        if (!parameterMatchingShape) {
          throw new RuleError({
            message: `Could not find a ${
              strict ? 'exact' : 'partial'
            } match in query parameters`,
          });
        }
      });
    },

    hasPathParameterMatching: (
      parameterShape: any,
      options: {
        strict?: boolean;
      } = {}
    ) => {
      const { strict = false } = options;

      addAssertion('have parameter matching shape', (operation) => {
        const parameterMatchingShape = [
          ...operation.pathParameters.values(),
        ].find((pathParameter) =>
          valuesMatcher(parameterShape, pathParameter.raw, strict)
        );
        if (!parameterMatchingShape) {
          throw new RuleError({
            message: `Could not find a ${
              strict ? 'exact' : 'partial'
            } match in path parameters`,
          });
        }
      });
    },

    hasHeaderParameterMatching: (
      parameterShape: any,
      options: {
        strict?: boolean;
      } = {}
    ) => {
      const { strict = false } = options;

      addAssertion('have parameter matching shape', (operation) => {
        const parameterMatchingShape = [
          ...operation.headerParameters.values(),
        ].find((headerParameter) =>
          valuesMatcher(parameterShape, headerParameter.raw, strict)
        );
        if (!parameterMatchingShape) {
          throw new RuleError({
            message: `Could not find a ${
              strict ? 'exact' : 'partial'
            } match in header parameters`,
          });
        }
      });
    },
    hasRequests: (requests) => {
      addAssertion('have requests with content-type', (operation) => {
        const operationRequestContentTypes = new Set(
          operation.requests.map((request) => request.contentType)
        );
        for (const { contentType } of requests) {
          if (!operationRequestContentTypes.has(contentType)) {
            throw new RuleError({
              message: `Operation does not have request with content-type ${contentType}`,
            });
          }
        }
      });
    },
    hasResponses: (responses) => {
      addAssertion('have responses', (operation) => {
        for (const { contentType, statusCode } of responses) {
          const maybeResponse = operation.responses.get(statusCode);
          if (!maybeResponse) {
            throw new RuleError({
              message: `Operation does not have response of status code ${statusCode}`,
            });
          }
          if (
            contentType &&
            !maybeResponse.bodies.find(
              (body) => body.contentType === contentType
            )
          ) {
            throw new RuleError({
              message: `Operation does not have response with content-type ${contentType} for status code ${statusCode} `,
            });
          }
        }
      });
    },
  };
};
