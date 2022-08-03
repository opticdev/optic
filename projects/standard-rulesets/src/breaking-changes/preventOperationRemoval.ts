import { OperationRule, RuleError } from '@useoptic/rulesets-base';

export const preventOperationRemoval = new OperationRule({
  name: 'prevent operation removal',
  rule: (operationAssertions) => {
    operationAssertions.removed('not remove operation', () => {
      throw new RuleError({
        message: 'cannot remove an operation',
      });
    });
  },
});
