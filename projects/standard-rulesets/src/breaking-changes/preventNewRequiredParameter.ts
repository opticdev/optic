import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';

const getPreventNewRequiredParameter = (parameterIn: ParameterIn) =>
  new OperationRule({
    name: `prevent new required ${parameterIn} parameters`,
    matches: (_operation, ruleContext) =>
      ruleContext.operation.change !== 'added', // rule doesn't apply for new operations
    rule: (operationAssertions, _ruleContext) => {
      const parameter = getOperationAssertionsParameter(
        operationAssertions,
        parameterIn
      );

      parameter.added(
        `not add required ${parameterIn} parameter`,
        (parameter) => {
          if (parameter.value.required) {
            throw new RuleError({
              message: `cannot add a required ${parameterIn} parameter to an existing operation`,
            });
          }
        }
      );
    },
  });

export const preventNewRequiredQueryParameter =
  getPreventNewRequiredParameter('query');

export const preventNewRequiredCookieParameter =
  getPreventNewRequiredParameter('cookie');

export const preventNewRequiredHeaderParameter =
  getPreventNewRequiredParameter('header');
