import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { appliesWhen } from './constants';

export const requireOperationSummary = (
  applies: (typeof appliesWhen)[number]
) =>
  new OperationRule({
    name: 'require operation summary',
    rule: (operationAssertions) => {
      const lifecycle = applies === 'always' ? 'requirement' : applies;
      operationAssertions[lifecycle]((operation) => {
        if (!operation.raw.summary) {
          throw new RuleError({
            message: `an operation summary must be included`,
          });
        }
      });
    },
  });
