import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';

export const preventResponsePropertyRemoval = () =>
  new ResponseBodyRule({
    name: 'prevent removing response property',
    rule: (responseAssertions) => {
      responseAssertions.property.removed((property) => {
        throw new RuleError({
          message: `cannot remove response property '${property.value.key}'. This is a breaking change.`,
        });
      });
    },
  });
