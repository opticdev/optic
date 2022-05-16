import { OperationRule, RuleError } from '@useoptic/rulesets-base';

export const preventCookieParameterRequired = new OperationRule({
  name: 'prevent new required cookie parameters',
  rule: (operationAssertions, ruleContext) => {
    operationAssertions.cookieParameter.added(
      'not add required cookie parameter',
      (parameter) => {
        if (ruleContext.operation.change === 'added') return; // rule doesn't apply for new operations
        if (parameter.value.required) {
          throw new RuleError({
            message:
              'cannot add a required cookie parameter to an existing operation',
          });
        }
      }
    );

    operationAssertions.cookieParameter.changed(
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
