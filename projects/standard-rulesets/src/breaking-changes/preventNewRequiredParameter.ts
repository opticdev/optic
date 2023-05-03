import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { getOperationAssertionsParameter } from './helpers/getOperationAssertionsParameter';
import { ParameterIn } from './helpers/types';

const getName = <P extends ParameterIn>(parameterIn: P) =>
  `prevent new required ${parameterIn} parameters` as const;

const getPreventNewRequiredParameter = (parameterIn: ParameterIn) =>
  new OperationRule({
    name: getName(parameterIn),
    matches: (_operation, ruleContext) =>
      ruleContext.operation.change !== 'added', // rule doesn't apply for new operations
    rule: (operationAssertions, _ruleContext) => {
      const parameter = getOperationAssertionsParameter(
        operationAssertions,
        parameterIn
      );

      parameter.added((parameter) => {
        if (parameter.value.required) {
          throw new RuleError({
            message: `cannot add required ${parameterIn} parameter ${parameter.value.name} to an existing operation. This is a breaking change.`,
          });
        }
      });
    },
  });

export const preventNewRequiredQueryParameter = () =>
  getPreventNewRequiredParameter('query');

export const preventNewRequiredCookieParameter = () =>
  getPreventNewRequiredParameter('cookie');

export const preventNewRequiredHeaderParameter = () =>
  getPreventNewRequiredParameter('header');
