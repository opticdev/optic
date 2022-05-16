import { OpenApiKind } from '@useoptic/openapi-utilities';
import {
  FactVariantWithRaw,
  OperationRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';
import { OperationAssertions } from '@useoptic/rulesets-base';

export const createCookieParameterChecks = (
  applies: typeof appliesWhen[number],
  format: typeof casing[number]
) => {
  const caseCondition = `cookie parameter must be ${format} when ${applies}`;
  const parameterTest = (
    parameter: FactVariantWithRaw<OpenApiKind.CookieParameter>
  ) => {
    if (!isCase(parameter.value.name, format)) {
      throw new RuleError({
        message: `${parameter.value.name} is not ${format}`,
      });
    }
  };

  const cookieParameterChecks = new OperationRule({
    name: 'cookie parameter naming check',
    rule: (operationAssertions: OperationAssertions) => {
      if (applies === 'always') {
        operationAssertions.cookieParameter.requirement(
          caseCondition,
          parameterTest
        );
      } else if (applies === 'addedOrChanged') {
        operationAssertions.cookieParameter.added(caseCondition, parameterTest);
        operationAssertions.cookieParameter.changed(
          caseCondition,
          (_before, after) => parameterTest(after)
        );
      } else if (applies === 'added') {
        operationAssertions.cookieParameter.added(caseCondition, parameterTest);
      }
    },
  });

  return cookieParameterChecks;
};
