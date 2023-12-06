import { RuleError } from '../../errors';
import { Assertion, AssertionTypeToHelpers } from '../../types';
import { valuesMatcher } from './utils';

export const createOperationHelpers = (
  addAssertion: (condition: string, assertion: Assertion<'operation'>) => void
): AssertionTypeToHelpers['operation'] => {
  const createAssertions = (
    isNot: boolean
  ): AssertionTypeToHelpers['operation'] => {
    const conditionPrefix = isNot ? 'not ' : '';
    return {
      get not(): AssertionTypeToHelpers['operation'] {
        return createAssertions(true);
      },
      matches: (
        reference: any,
        options: {
          strict?: boolean;
          errorMessage?: string;
        } = {}
      ) => {
        addAssertion(conditionPrefix + 'match expected shape', (value) => {
          const { strict = false, errorMessage } = options;
          if (isNot) {
            if (valuesMatcher(reference, value.raw, strict)) {
              throw new RuleError({
                message: errorMessage
                  ? errorMessage
                  : strict
                    ? 'Expected to not find an exact match'
                    : 'Expected to not find a partial match',
                received: value.raw,
                expected: reference,
              });
            }
          } else {
            if (!valuesMatcher(reference, value.raw, strict)) {
              throw new RuleError({
                message: errorMessage
                  ? errorMessage
                  : strict
                    ? 'Expected an exact match'
                    : 'Expected a partial match',
                received: value.raw,
                expected: reference,
              });
            }
          }
        });
      },
      matchesOneOf: (
        references: any[],
        options: {
          strict?: boolean;
          errorMessage?: string;
        } = {}
      ) => {
        addAssertion(conditionPrefix + 'match expected shape', (value) => {
          const { strict = false, errorMessage } = options;
          if (isNot) {
            const matchesNone = references.every(
              (reference) => !valuesMatcher(reference, value.raw, strict)
            );

            if (!matchesNone) {
              throw new RuleError({
                message: errorMessage
                  ? errorMessage
                  : strict
                    ? 'Expected to not find any exact matches'
                    : 'Expected to not find any partial matches',
                received: value.raw,
                expected: references,
              });
            }
          } else {
            const matchesAtleastOne = references.some((reference) =>
              valuesMatcher(reference, value.raw, strict)
            );
            if (!matchesAtleastOne) {
              throw new RuleError({
                message: errorMessage
                  ? errorMessage
                  : strict
                    ? 'Expected at least one exact match'
                    : 'Expected at least one partial match',
                received: value.raw,
                expected: references,
              });
            }
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

        addAssertion(
          conditionPrefix + 'have query parameter matching shape',
          (operation) => {
            const parameterMatchingShape = [
              ...operation.queryParameters.values(),
            ].find((queryParameter) =>
              valuesMatcher(parameterShape, queryParameter.raw, strict)
            );
            if (isNot) {
              if (parameterMatchingShape) {
                throw new RuleError({
                  message: `Found a ${
                    strict ? 'exact' : 'partial'
                  } match in query parameters`,
                });
              }
            } else {
              if (!parameterMatchingShape) {
                throw new RuleError({
                  message: `Could not find a ${
                    strict ? 'exact' : 'partial'
                  } match in query parameters`,
                });
              }
            }
          }
        );
      },

      hasPathParameterMatching: (
        parameterShape: any,
        options: {
          strict?: boolean;
        } = {}
      ) => {
        const { strict = false } = options;

        addAssertion(
          conditionPrefix + 'have path parameter matching shape',
          (operation) => {
            const parameterMatchingShape = [
              ...operation.pathParameters.values(),
            ].find((pathParameter) =>
              valuesMatcher(parameterShape, pathParameter.raw, strict)
            );
            if (isNot) {
              if (parameterMatchingShape) {
                throw new RuleError({
                  message: `Found a ${
                    strict ? 'exact' : 'partial'
                  } match in path parameters. Value to match: ${JSON.stringify(
                    parameterShape
                  )}`,
                });
              }
            } else {
              if (!parameterMatchingShape) {
                throw new RuleError({
                  message: `Could not find a ${
                    strict ? 'exact' : 'partial'
                  } match in path parameters. Value to match: ${JSON.stringify(
                    parameterShape
                  )}`,
                });
              }
            }
          }
        );
      },

      hasHeaderParameterMatching: (
        parameterShape: any,
        options: {
          strict?: boolean;
        } = {}
      ) => {
        const { strict = false } = options;

        addAssertion(
          conditionPrefix + 'have header parameter matching shape',
          (operation) => {
            const parameterMatchingShape = [
              ...operation.headerParameters.values(),
            ].find((headerParameter) =>
              valuesMatcher(parameterShape, headerParameter.raw, strict)
            );
            if (isNot) {
              if (parameterMatchingShape) {
                throw new RuleError({
                  message: `Found a ${
                    strict ? 'exact' : 'partial'
                  } match in header parameters. Value to match: ${JSON.stringify(
                    parameterShape
                  )}`,
                });
              }
            } else {
              if (!parameterMatchingShape) {
                throw new RuleError({
                  message: `Could not find a ${
                    strict ? 'exact' : 'partial'
                  } match in header parameters. Value to match: ${JSON.stringify(
                    parameterShape
                  )}`,
                });
              }
            }
          }
        );
      },
      hasCookieParameterMatching: (
        parameterShape: any,
        options: {
          strict?: boolean;
        } = {}
      ) => {
        const { strict = false } = options;

        addAssertion(
          conditionPrefix + 'have cookie parameter matching shape',
          (operation) => {
            const parameterMatchingShape = [
              ...operation.cookieParameters.values(),
            ].find((cookieParameter) =>
              valuesMatcher(parameterShape, cookieParameter.raw, strict)
            );
            if (isNot) {
              if (parameterMatchingShape) {
                throw new RuleError({
                  message: `Found a ${
                    strict ? 'exact' : 'partial'
                  } match in cookie parameters. Value to match: ${JSON.stringify(
                    parameterShape
                  )}`,
                });
              }
            } else {
              if (!parameterMatchingShape) {
                throw new RuleError({
                  message: `Could not find a ${
                    strict ? 'exact' : 'partial'
                  } match in cookie parameters. Value to match: ${JSON.stringify(
                    parameterShape
                  )}`,
                });
              }
            }
          }
        );
      },
      hasRequests: (requests) => {
        addAssertion(
          conditionPrefix + 'have requests with content-type',
          (operation) => {
            const operationRequestContentTypes = new Set(
              operation.requests.map((request) => request.contentType)
            );
            if (isNot) {
              for (const { contentType } of requests) {
                if (operationRequestContentTypes.has(contentType)) {
                  throw new RuleError({
                    message: `Operation has request with content-type ${contentType}`,
                  });
                }
              }
            } else {
              for (const { contentType } of requests) {
                if (!operationRequestContentTypes.has(contentType)) {
                  throw new RuleError({
                    message: `Operation does not have request with content-type ${contentType}`,
                  });
                }
              }
            }
          }
        );
      },
      hasResponses: (responses) => {
        addAssertion(conditionPrefix + 'have responses', (operation) => {
          if (isNot) {
            for (const { contentType, statusCode } of responses) {
              const maybeResponse = operation.responses.get(statusCode);
              if (contentType) {
                if (
                  maybeResponse &&
                  maybeResponse.bodies.find(
                    (body) => body.contentType === contentType
                  )
                ) {
                  throw new RuleError({
                    message: `Operation has response with content-type ${contentType} for status code ${statusCode} `,
                  });
                }
              } else {
                if (maybeResponse) {
                  throw new RuleError({
                    message: `Operation has response of status code ${statusCode}`,
                  });
                }
              }
            }
          } else {
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
          }
        });
      },
    };
  };

  return createAssertions(false);
};
