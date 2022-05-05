import { RequestRule, RuleError } from '@useoptic/rulesets-base';

export const preventRequestPropertyTypeChange = new RequestRule({
  name: 'prevent request property type changes',
  rule: (requestAssertions) => {
    requestAssertions.body.changed(
      'not change request property type',
      (before, after) => {
        if (before.value.flatSchema.type !== after.value.flatSchema.type) {
          throw new RuleError({
            message: 'expected request body property to not change type',
          });
        }
      }
    );

    requestAssertions.property.changed(
      'not change request property type',
      (before, after) => {
        if (before.value.flatSchema.type !== after.value.flatSchema.type) {
          throw new RuleError({
            message: 'expected request body property to not change type',
          });
        }
      }
    );
  },
});
