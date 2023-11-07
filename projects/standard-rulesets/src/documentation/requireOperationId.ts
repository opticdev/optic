import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { appliesWhen } from './constants';

export const requireOperationId = (applies: (typeof appliesWhen)[number]) =>
  new OperationRule({
    name: 'require operation id',
    rule: (operationAssertions) => {
      const lifecycle = applies === 'always' ? 'requirement' : applies;
      operationAssertions[lifecycle]((operation) => {
        if (!operation.raw.operationId) {
          throw new RuleError({
            message: `an operation id must be included`,
          });
        }
      });
    },
  });
