import { RuleError } from '../../errors';
import { AssertionTypeToHelpers } from '../../types';
import { CallableAssertion } from '../rule-runner-types';
import { valuesMatcher } from './utils';

export const createResponseHelpers = (
  addAssertion: (
    condition: string,
    assertion: CallableAssertion<'response'>
  ) => void
): AssertionTypeToHelpers['response'] => {
  const createAssertions = (
    isNot: boolean
  ): AssertionTypeToHelpers['response'] => {
    const conditionPrefix = isNot ? 'not ' : '';

    return {
      get not(): AssertionTypeToHelpers['response'] {
        return createAssertions(true);
      },
      hasResponseHeaderMatching: (
        name: string,
        reference: any,
        options: {
          strict?: boolean;
        } = {}
      ) => {
        const { strict = false } = options;

        addAssertion(
          conditionPrefix + 'have response header matching shape',
          (response) => {
            const headerMatchingShapeAndName = [
              ...response.headers.entries(),
            ].find(
              ([headerName, responseHeader]) =>
                name === headerName &&
                valuesMatcher(reference, responseHeader.raw, strict)
            );
            if (isNot) {
              if (headerMatchingShapeAndName) {
                throw new RuleError({
                  message: `Found a ${
                    strict ? 'exact' : 'partial'
                  } match in header parameters`,
                });
              }
            } else {
              if (!headerMatchingShapeAndName) {
                throw new RuleError({
                  message: `Could not find a ${
                    strict ? 'exact' : 'partial'
                  } match in header parameters`,
                });
              }
            }
          }
        );
      },
    };
  };

  return createAssertions(false);
};
