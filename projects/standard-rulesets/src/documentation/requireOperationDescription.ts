import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { appliesWhen } from './constants';

export const requireOperationDescription = (
  applies: (typeof appliesWhen)[number]
) =>
  new OperationRule({
    name: 'require operation description',
    rule: (operationAssertions) => {
      const lifecycle = applies === 'always' ? 'requirement' : applies;
      operationAssertions[lifecycle]((operation) => {
        if (!operation.raw.description) {
          throw new RuleError({
            message: `an operation description must be included`,
          });
        }
      });
    },
  });
