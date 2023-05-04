import { RequestRule, RuleError } from '@useoptic/rulesets-base';
import { didTypeChange } from './helpers/type-change';

export const preventRequestPropertyTypeChange = () =>
  new RequestRule({
    name: 'prevent request property type changes',
    rule: (requestAssertions) => {
      requestAssertions.body.changed((before, after) => {
        if (
          didTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          )
        ) {
          throw new RuleError({
            message: `expected request body ${after.value.contentType} root shape to not change type. This is a breaking change.`,
          });
        }
      });

      requestAssertions.property.changed((before, after) => {
        if (
          didTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          )
        ) {
          throw new RuleError({
            message: `expected request body property '${after.value.key}' to not change type. This is a breaking change.`,
          });
        }
      });
    },
  });
