import {
  QueryParameter,
  OperationRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createOperationIdRule = (
  applies: (typeof appliesWhen)[number],
  format: (typeof casing)[number]
) => {
  const operationIdTest = (operationId: string) => {
    if (!isCase(operationId, format)) {
      throw new RuleError({
        message: `${operationId} is not ${format}`,
      });
    }
  };

  const operationIdChecks = new OperationRule({
    name: 'operationId naming check',
    rule: (operationAssertions) => {
      if (applies === 'always') {
        operationAssertions.requirement((operation) => {
          if (operation.raw.operationId)
            operationIdTest(operation.raw.operationId);
        });
      } else if (applies === 'addedOrChanged') {
        operationAssertions.added((operation) => {
          if (operation.raw.operationId)
            operationIdTest(operation.raw.operationId);
        });
        operationAssertions.changed((before, after) => {
          if (
            before.raw.operationId &&
            after.raw.operationId &&
            before.raw.operationId !== after.raw.operationId
          ) {
            operationIdTest(after.raw.operationId);
          }
        });
      } else if (applies === 'added') {
        operationAssertions.added((operation) => {
          if (operation.raw.operationId)
            operationIdTest(operation.raw.operationId);
        });
      }
    },
  });

  return operationIdChecks;
};
