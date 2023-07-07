import {
  HeaderParameter,
  OperationRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createRequestHeaderParameterChecks = (
  applies: (typeof appliesWhen)[number],
  format: (typeof casing)[number]
) => {
  const parameterTest = (parameter: HeaderParameter) => {
    if (!isCase(parameter.value.name, format)) {
      throw new RuleError({
        message: `${parameter.value.name} is not ${format}`,
      });
    }
  };

  const headerParameterChecks = new OperationRule({
    name: 'header parameter naming check',
    rule: (operationAssertions) => {
      if (applies === 'always') {
        operationAssertions.headerParameter.requirement(parameterTest);
      } else if (applies === 'addedOrChanged') {
        operationAssertions.headerParameter.added(parameterTest);
        operationAssertions.headerParameter.changed((before, after) =>
          parameterTest(after)
        );
      } else if (applies === 'added') {
        operationAssertions.headerParameter.added(parameterTest);
      }
    },
  });

  return headerParameterChecks;
};
