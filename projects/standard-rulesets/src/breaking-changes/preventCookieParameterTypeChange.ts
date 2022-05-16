import { OperationRule, RuleError } from '@useoptic/rulesets-base';

export const preventCookieParameterTypeChange = new OperationRule({
  name: 'prevent cookie parameter type changes',
  rule: (operationAssertions, _ruleContext) => {
    operationAssertions.cookieParameter.changed(
      'not change parameter type',
      (before, after) => {
        // TODO: this has some possible false positives as something could change from having a type
        //  to being a oneOf, anyOf, or allOf
        if (
          before.value.schema &&
          'type' in before.value.schema &&
          after.value.schema &&
          'type' in after.value.schema &&
          before.value.schema.type !== after.value.schema.type
        ) {
          throw new RuleError({
            message: 'expected cookie parameter to not change type',
          });
        }
      }
    );
  },
});
