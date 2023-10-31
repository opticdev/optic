import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { computeEffectiveTypeChange } from './helpers/type-change';
import { isInUnionProperty, schemaIsUnion } from './helpers/unions';

export const preventResponsePropertyTypeChange = () =>
  new ResponseBodyRule({
    name: 'prevent response property type changes',
    rule: (responseAssertions) => {
      responseAssertions.body.changed((before, after) => {
        // Children of union properties / transitions are handled in a separate rule
        if (
          schemaIsUnion(before.value.flatSchema) ||
          schemaIsUnion(after.value.flatSchema)
        ) {
          return;
        }
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
        // Children of union properties / transitions are handled in a separate rule
        if (
          schemaIsUnion(before.value.flatSchema) ||
          isInUnionProperty(before.location.jsonPath) ||
          schemaIsUnion(after.value.flatSchema) ||
          isInUnionProperty(after.location.jsonPath)
        ) {
          return;
        }
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
