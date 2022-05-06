import { OperationRule, RuleError } from '@useoptic/rulesets-base';

export const preventQueryParameterRequired = new OperationRule({
  name: 'prevent new required query parameters',
  rule: (operationAssertions, ruleContext) => {
    operationAssertions.queryParameter.added(
      'not add required query parameter',
      (parameter) => {
        if (ruleContext.operation.change === 'added') return; // rule doesn't apply for new operations
        if (parameter.value.required) {
          throw new RuleError({
            message:
              'cannot add a required query parameter to an existing operation',
          });
        }
      }
    );

    operationAssertions.queryParameter.changed(
      'not make an optional parameter required',
      (before, after) => {
        if (!before.value.required && after.value.required) {
          throw new RuleError({
            message: 'cannot make an optional parameter required',
          });
        }
      }
    );
  },
});
