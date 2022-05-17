import { ResponseRule, RuleError } from '@useoptic/rulesets-base';

export const preventResponseStatusCodeRemoval = new ResponseRule({
  name: 'prevent response status code removal',
  rule: (responseAssertions) => {
    responseAssertions.removed('not remove response status code', (value) => {
      if (value) {
        throw new RuleError({
          message: 'must not remove response status code',
        });
      }
    });
  },
});
