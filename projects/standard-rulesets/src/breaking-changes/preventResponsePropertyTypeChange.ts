import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { didTypeChange } from './helpers/type-change';

export const preventResponsePropertyTypeChange = () =>
  new ResponseBodyRule({
    name: 'prevent response property type changes',
    rule: (responseAssertions) => {
      responseAssertions.body.changed((before, after) => {
        if (
          didTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          )
        ) {
          throw new RuleError({
            message: `expected response body ${after.value.contentType} root shape to not change type. This is a breaking change.`,
          });
        }
      });

      responseAssertions.property.changed((before, after) => {
        if (
          didTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          )
        ) {
          throw new RuleError({
            message: `expected response body property '${after.value.key}' to not change type. This is a breaking change.`,
          });
        }
      });
    },
  });
