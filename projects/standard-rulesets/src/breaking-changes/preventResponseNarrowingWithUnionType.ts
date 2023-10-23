import { ResponseBodyRule, RuleError } from '@useoptic/rulesets-base';
import { computeUnionTransition, schemaIsUnion } from './helpers/unions';

export const preventResponseNarrowingInUnionTypes = () =>
  new ResponseBodyRule({
    name: 'prevent narrowing in response union types',
    rule: (responseBodyAssertions) => {
      responseBodyAssertions.body.changed((before, after) => {
        const beforeSchema = before.raw.schema;
        const afterSchema = after.raw.schema;
        if (!beforeSchema || !afterSchema) return;
        if (schemaIsUnion(beforeSchema) || schemaIsUnion(afterSchema)) {
          const results = computeUnionTransition(beforeSchema, afterSchema);
          if (results.narrowed) {
            // TODO add in the reason of where something was narrowed
            throw new RuleError({ message: 'cannot narrow a response body' });
          }
        }
      });

      responseBodyAssertions.property.changed((before, after) => {
        const beforeSchema = before.raw;
        const afterSchema = after.raw;
        if (!beforeSchema || !afterSchema) return;
        if (schemaIsUnion(beforeSchema) || schemaIsUnion(afterSchema)) {
          const results = computeUnionTransition(beforeSchema, afterSchema);
          if (results.narrowed) {
            // TODO add in the reason of where something was narrowed
            throw new RuleError({ message: 'cannot narrow a response body' });
          }
        }
      });
    },
  });
