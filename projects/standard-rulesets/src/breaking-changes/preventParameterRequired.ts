import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';

const getPreventParameterRequired = (parameterIn: ParameterIn) =>
  new OperationRule({
    name: `prevent ${parameterIn} parameters enum breaking changes`,
    rule: (operationAssertions, ruleContext) => {
      const parameter = getOperationAssertionsParameter(
        operationAssertions,
        parameterIn
      );

      parameter.added('not add required cookie parameter', (parameter) => {
        if (ruleContext.operation.change === 'added') return; // rule doesn't apply for new operations
        if (parameter.value.required) {
          throw new RuleError({
            message: `cannot add a required ${parameterIn} parameter to an existing operation`,
          });
        }
      });

      parameter.changed(
        'not make an optional parameter required',
        (before, after) => {
          if (!before.value.required && after.value.required) {
            throw new RuleError({
              message: 'cannot make an optional parameter required',
            });
          }
        }
      );
    },
  });

export const preventQueryParameterRequired =
  getPreventParameterRequired('query');

export const preventCookieParameterRequired =
  getPreventParameterRequired('cookie');

export const preventPathParameterRequired = getPreventParameterRequired('path');

export const preventHeaderParameterRequired =
  getPreventParameterRequired('header');
