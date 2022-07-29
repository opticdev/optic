import {
  ResponseHeader,
  ResponseRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createResponseHeaderParameterChecks = (
  applies: typeof appliesWhen[number],
  format: typeof casing[number]
) => {
  const caseCondition = `response header parameter must be ${format}`;
  const parameterTest = (parameter: ResponseHeader) => {
    if (!isCase(parameter.value.name, format)) {
      throw new RuleError({
        message: `${parameter.value.name} is not ${format}`,
      });
    }
  };

  const headerParameterChecks = new ResponseRule({
    name: 'header parameter naming check',
    rule: (responseAssertions) => {
      if (applies === 'always') {
        responseAssertions.header.requirement(caseCondition, parameterTest);
      } else if (applies === 'addedOrChanged') {
        responseAssertions.header.added(caseCondition, parameterTest);
        responseAssertions.header.changed(caseCondition, (before, after) =>
          parameterTest(after)
        );
      } else if (applies === 'added') {
        responseAssertions.header.added(caseCondition, parameterTest);
      }
    },
  });

  return headerParameterChecks;
};
