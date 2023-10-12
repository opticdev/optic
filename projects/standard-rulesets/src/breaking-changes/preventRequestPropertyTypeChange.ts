import { RequestRule, RuleError } from '@useoptic/rulesets-base';
import { computeEffectiveTypeChange } from './helpers/type-change';
import { isInUnionProperty } from './helpers/inUnionType';

export const preventRequestPropertyTypeChange = () =>
  new RequestRule({
    name: 'prevent request property type changes',
    rule: (requestAssertions) => {
      requestAssertions.body.changed((before, after) => {
        // Children of union properties / transitions are handled in a separate rule
        if (
          isInUnionProperty(before.location.jsonPath) ||
          isInUnionProperty(after.location.jsonPath)
        ) {
          return;
        }

        if (
          computeEffectiveTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          ).narrowed
        ) {
          throw new RuleError({
            message: `expected request body ${after.value.contentType} root shape not to be narrowed. This is a breaking change.`,
          });
        }
      });

      requestAssertions.property.changed((before, after) => {
        // Children of union properties / transitions are handled in a separate rule
        if (
          isInUnionProperty(before.location.jsonPath) ||
          isInUnionProperty(after.location.jsonPath)
        ) {
          return;
        }
        if (
          computeEffectiveTypeChange(
            before.value.flatSchema.type,
            after.value.flatSchema.type
          ).narrowed
        ) {
          throw new RuleError({
            message: `expected request body property '${after.value.key}' not to be narrowed. This is a breaking change.`,
          });
        }
      });
    },
  });
