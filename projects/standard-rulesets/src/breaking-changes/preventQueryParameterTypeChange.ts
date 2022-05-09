import { OperationRule, RuleError } from '@useoptic/rulesets-base';

export const preventQueryParameterTypeChange = new OperationRule({
  name: 'prevent query parameter type changes',
  rule: (operationAssertions, ruleContext) => {
    operationAssertions.queryParameter.changed(
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
            message: 'expected query parameter to not change type',
          });
        }
      }
    );
  },
});
