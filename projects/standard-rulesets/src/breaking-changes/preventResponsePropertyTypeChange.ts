import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { computeEffectiveTypeChange } from './helpers/type-change';

export const preventResponsePropertyTypeChange = () =>
  new ResponseBodyRule({
    name: 'prevent response property type changes',
    rule: (responseAssertions) => {
      responseAssertions.body.changed((before, after) => {
        if (
          computeEffectiveTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          ).expanded
        ) {
          throw new RuleError({
            message: `expected response body ${after.value.contentType} root shape not to be expanded. This is a breaking change.`,
          });
        }
      });

      responseAssertions.property.changed((before, after) => {
        if (
          computeEffectiveTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          ).expanded
        ) {
          throw new RuleError({
            message: `expected response body property '${after.value.key}' not to be expanded. This is a breaking change.`,
          });
        }
      });
    },
  });
