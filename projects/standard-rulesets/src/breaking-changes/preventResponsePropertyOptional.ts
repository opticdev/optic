import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { isInUnionProperty } from './helpers/inUnionType';

export const preventResponsePropertyOptional = () =>
  new ResponseBodyRule({
    name: 'prevent making response property optional',
    rule: (responseAssertions) => {
      responseAssertions.property.changed((before, after) => {
        // Children of union properties / transitions are handled in a separate rule
        if (
          isInUnionProperty(before.location.jsonPath) ||
          isInUnionProperty(after.location.jsonPath)
        ) {
          return;
        }
        if (before.value.required && !after.value.required) {
          throw new RuleError({
            message: `cannot make required response property '${after.value.key}' optional. This is a breaking change.`,
          });
        }
      });
    },
  });
