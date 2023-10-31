import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { isInUnionProperty, schemaIsUnion } from './helpers/unions';

export const preventResponsePropertyOptional = () =>
  new ResponseBodyRule({
    name: 'prevent making response property optional',
    rule: (responseAssertions) => {
      responseAssertions.property.changed((before, after) => {
        // Children of union properties / transitions are handled in a separate rule
        if (
          schemaIsUnion(before.value.flatSchema) ||
          isInUnionProperty(before.location.jsonPath) ||
          schemaIsUnion(after.value.flatSchema) ||
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
