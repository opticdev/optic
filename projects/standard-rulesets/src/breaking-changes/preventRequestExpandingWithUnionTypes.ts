import { RequestRule, RuleError } from '@useoptic/rulesets-base';
import { computeUnionTransition, schemaIsUnion } from './helpers/unions';

export const preventRequestExpandingInUnionTypes = () =>
  new RequestRule({
    name: 'prevent expanded in request union types',
    rule: (requestAssertions) => {
      requestAssertions.body.changed((before, after) => {
        const beforeSchema = before.raw.schema;
        const afterSchema = after.raw.schema;
        if (!beforeSchema || !afterSchema) return;
        if (schemaIsUnion(beforeSchema) || schemaIsUnion(afterSchema)) {
          const results = computeUnionTransition(beforeSchema, afterSchema);
          if (results.expanded) {
            // TODO add in the reason of where something was expanded
            throw new RuleError({ message: 'cannot expand a request body' });
          }
        }
      });

      requestAssertions.property.changed((before, after) => {
        const beforeSchema = before.raw;
        const afterSchema = after.raw;
        if (!beforeSchema || !afterSchema) return;
        if (schemaIsUnion(beforeSchema) || schemaIsUnion(afterSchema)) {
          const results = computeUnionTransition(beforeSchema, afterSchema);
          if (results.expanded) {
            // TODO add in the reason of where something was expanded
            throw new RuleError({ message: 'cannot expand a request body' });
          }
        }
      });
    },
  });
