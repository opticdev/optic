import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { isInUnionProperty } from './helpers/unions';

export const preventResponsePropertyRemoval = () =>
  new ResponseBodyRule({
    name: 'prevent removing response property',
    rule: (responseAssertions) => {
      responseAssertions.property.removed((property) => {
        // Children of union properties / transitions are handled in a separate rule
        if (isInUnionProperty(property.location.jsonPath)) {
          return;
        }
        throw new RuleError({
          message: `cannot remove response property '${property.value.key}'. This is a breaking change.`,
        });
      });
    },
  });
