import { RequestRule, RuleError } from '@useoptic/rulesets-base';
import { isInUnionProperty, schemaIsUnion } from './helpers/unions';

export const preventRequestPropertyRequired = () =>
  new RequestRule({
    name: 'prevent changing request property to required',
    rule: (requestAssertions, ruleContext) => {
      requestAssertions.property.added((property) => {
        const beforePolymorphicSchemas = [
          ...ruleContext.operation.polymorphicSchemas.before.values(),
        ];

        if (ruleContext.operation.change === 'added') return; // rule doesn't apply for new operations
        // Children of union properties / transitions are handled in a separate rule
        if (
          schemaIsUnion(property.value.flatSchema) ||
          isInUnionProperty(property.location.jsonPath) ||
          beforePolymorphicSchemas.some((schemaPath) =>
            property.location.jsonPath.startsWith(schemaPath)
          )
        ) {
          return;
        }
        if (property.value.required) {
          throw new RuleError({
            message: `cannot add a required request property '${property.value.key}' to an existing operation. This is a breaking change.`,
          });
        }
      });

      requestAssertions.property.changed((before, after) => {
        // Children of union properties / transitions are handled in a separate rule
        if (
          schemaIsUnion(before.value.flatSchema) ||
          isInUnionProperty(before.location.jsonPath) ||
          schemaIsUnion(after.value.flatSchema) ||
          isInUnionProperty(after.location.jsonPath)
        ) {
          return;
        }
        if (!before.value.required && after.value.required) {
          throw new RuleError({
            message: `cannot make a request property required. This is a breaking change.`,
          });
        }
      });
    },
  });
