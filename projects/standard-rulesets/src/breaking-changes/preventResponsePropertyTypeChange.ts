import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';

export const preventResponsePropertyTypeChange = new ResponseBodyRule({
  name: 'prevent response property type changes',
  rule: (responseAssertions) => {
    responseAssertions.body.changed(
      'not change response property type',
      (before, after) => {
        if (before.value.flatSchema.type !== after.value.flatSchema.type) {
          throw new RuleError({
            message: 'expected response body property to not change type',
          });
        }
      }
    );

    responseAssertions.property.changed(
      'not change response property type',
      (before, after) => {
        if (before.value.flatSchema.type !== after.value.flatSchema.type) {
          throw new RuleError({
            message: 'expected response body property to not change type',
          });
        }
      }
    );
  },
});
