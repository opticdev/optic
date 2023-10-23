import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { isInUnionProperty } from './helpers/unions';

export const preventResponsePropertyRemoval = () =>
  new ResponseBodyRule({
    name: 'prevent removing response property',
    rule: (responseAssertions, ruleContext) => {
      responseAssertions.property.removed((property) => {
        const afterPolymorphicSchemas = [
          ...ruleContext.operation.polymorphicSchemas.after.values(),
        ];
        // Children of union properties / transitions are handled in a separate rule
        if (
          isInUnionProperty(property.location.jsonPath) ||
          afterPolymorphicSchemas.some((schemaPath) =>
            property.location.jsonPath.startsWith(schemaPath)
          )
        ) {
          return;
        }
        throw new RuleError({
          message: `cannot remove response property '${property.value.key}'. This is a breaking change.`,
        });
      });
    },
  });
