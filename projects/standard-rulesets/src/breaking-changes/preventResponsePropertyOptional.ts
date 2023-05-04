import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';

export const preventResponsePropertyOptional = () =>
  new ResponseBodyRule({
    name: 'prevent making response property optional',
    rule: (responseAssertions) => {
      responseAssertions.property.changed((before, after) => {
        if (before.value.required && !after.value.required) {
          throw new RuleError({
            message: `cannot make required response property '${after.value.key}' optional. This is a breaking change.`,
          });
        }
      });
    },
  });
