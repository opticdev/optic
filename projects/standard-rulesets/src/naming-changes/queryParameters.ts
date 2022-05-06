import { OpenApiKind } from '@useoptic/openapi-utilities';
import {
  FactVariantWithRaw,
  OperationRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createQueryParameterChecks = (
  applies: typeof appliesWhen[number],
  format: typeof casing[number]
) => {
  const caseCondition = `query parameter must be ${format} when ${applies}`;
  const parameterTest = (
    parameter: FactVariantWithRaw<OpenApiKind.QueryParameter>
  ) => {
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
        operationAssertions.queryParameter.requirement(
          caseCondition,
          parameterTest
        );
      } else if (applies === 'addedOrChanged') {
        operationAssertions.queryParameter.added(caseCondition, parameterTest);
        operationAssertions.queryParameter.changed(
          caseCondition,
          (before, after) => parameterTest(after)
        );
      } else if (applies === 'added') {
        operationAssertions.queryParameter.added(caseCondition, parameterTest);
      }
    },
  });

  return queryParameterChecks;
};
