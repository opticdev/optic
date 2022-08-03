import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';

export const preventResponsePropertyRemoval = new ResponseBodyRule({
  name: 'prevent removing response property',
  rule: (responseAssertions) => {
    responseAssertions.property.removed(
      'not change response body property from required to optional',
      () => {
        throw new RuleError({
          message: 'cannot remove a response property',
        });
      }
    );
  },
});
