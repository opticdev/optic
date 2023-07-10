import {
  QueryParameter,
  OperationRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createQueryParameterChecks = (
  applies: (typeof appliesWhen)[number],
  format: (typeof casing)[number]
) => {
  const parameterTest = (parameter: QueryParameter) => {
    if (!isCase(parameter.value.name, format)) {
      throw new RuleError({
        message: `${parameter.value.name} is not ${format}`,
      });
    }
  };

  const queryParameterChecks = new OperationRule({
    name: 'query parameter naming check',
    rule: (operationAssertions) => {
      if (applies === 'always') {
        operationAssertions.queryParameter.requirement(parameterTest);
      } else if (applies === 'addedOrChanged') {
        operationAssertions.queryParameter.added(parameterTest);
        operationAssertions.queryParameter.changed((before, after) =>
          parameterTest(after)
        );
      } else if (applies === 'added') {
        operationAssertions.queryParameter.added(parameterTest);
      }
    },
  });

  return queryParameterChecks;
};
