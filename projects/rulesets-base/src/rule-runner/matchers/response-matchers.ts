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
  return {
    hasResponseHeaderMatching: (
      name: string,
      reference: any,
      options: {
        strict?: boolean;
      } = {}
    ) => {
      const { strict = false } = options;

      addAssertion('have response header matching shape', (response) => {
        const headerMatchingShapeAndName = [...response.headers.entries()].find(
          ([headerName, responseHeader]) =>
            name === headerName &&
            valuesMatcher(reference, responseHeader.raw, strict)
        );
        if (!headerMatchingShapeAndName) {
          throw new RuleError({
            message: `Could not find a ${
              strict ? 'exact' : 'partial'
            } match in header parameters`,
          });
        }
      });
    },
  };
};
