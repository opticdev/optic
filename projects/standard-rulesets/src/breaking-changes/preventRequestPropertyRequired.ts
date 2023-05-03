import { RequestRule, RuleError } from '@useoptic/rulesets-base';

export const preventRequestPropertyRequired = () =>
  new RequestRule({
    name: 'prevent changing request property to required',
    rule: (requestAssertions, ruleContext) => {
      requestAssertions.property.added((property) => {
        if (ruleContext.operation.change === 'added') return; // rule doesn't apply for new operations
        if (property.value.required) {
          throw new RuleError({
            message: `cannot add a required request property '${property.value.key}' to an existing operation. This is a breaking change.`,
          });
        }
      });

      requestAssertions.property.changed((before, after) => {
        if (!before.value.required && after.value.required) {
          throw new RuleError({
            message: `cannot make a request property required. This is a breaking change.`,
          });
        }
      });
    },
  });
