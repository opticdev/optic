import { RuleError } from '../../errors';
import { AssertionTypeToHelpers } from '../../types';
import { CallableAssertion } from '../rule-runner-types';
import { valuesMatcher } from './utils';

export const createSpecificationHelpers = (
  addAssertion: (
    condition: string,
    assertion: CallableAssertion<'specification'>
  ) => void
): AssertionTypeToHelpers['specification'] => {
  const createAssertions = (
    isNot: boolean
  ): AssertionTypeToHelpers['specification'] => {
    const conditionPrefix = isNot ? 'not ' : '';

    return {
      get not(): AssertionTypeToHelpers['specification'] {
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
      matchesOneOf: (
        references: any[],
        options: {
          strict?: boolean;
        } = {}
      ) => {
        addAssertion(conditionPrefix + 'match expected shape', (value) => {
          const { strict = false } = options;
          if (isNot) {
            const matchesNone = references.every(
              (reference) => !valuesMatcher(reference, value.raw, strict)
            );

            if (!matchesNone) {
              throw new RuleError({
                message: strict
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
                message: strict
                  ? 'Expected at least one exact match'
                  : 'Expected at least one partial match',
                received: value.raw,
                expected: references,
              });
            }
          }
        });
      },
    };
  };
  return createAssertions(false);
};
