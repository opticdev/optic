import { RuleError } from '../../errors';
import { AssertionTypeToHelpers } from '../../types';
import { CallableAssertion } from '../rule-runner-types';
import { valuesMatcher } from './utils';

export const createResponseBodyHelpers = (
  addAssertion: (
    condition: string,
    assertion: CallableAssertion<'response-body'>
  ) => void
): AssertionTypeToHelpers['response-body'] => {
  const createAssertions = (
    isNot: boolean
  ): AssertionTypeToHelpers['response-body'] => {
    const conditionPrefix = isNot ? 'not ' : '';

    return {
      get not(): AssertionTypeToHelpers['response-body'] {
        return createAssertions(true);
      },
      matches: (
        reference: any,
        options: {
          strict?: boolean;
        } = {}
      ) => {
        addAssertion(conditionPrefix + 'match expected shape', (value) => {
          const { strict = false } = options;
          if (isNot) {
            if (valuesMatcher(reference, value.raw, strict)) {
              throw new RuleError({
                message: strict
                  ? 'Expected to not find an exact match'
                  : 'Expected to not find a partial match',
                received: value.raw,
                expected: reference,
              });
            }
          } else {
            if (!valuesMatcher(reference, value.raw, strict)) {
              throw new RuleError({
                message: strict
                  ? 'Expected an exact match'
                  : 'Expected a partial match',
                received: value.raw,
                expected: reference,
              });
            }
          }
        });
      },
    };
  };
  return createAssertions(false);
};
