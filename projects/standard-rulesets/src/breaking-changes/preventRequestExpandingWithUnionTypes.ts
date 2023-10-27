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
          if (results.request) {
            const keyword =
              'oneOf' in beforeSchema || 'oneOf' in afterSchema
                ? 'oneOf'
                : 'anyOf';
            const prefix =
              schemaIsUnion(beforeSchema) && schemaIsUnion(afterSchema)
                ? `request body ${keyword} schema`
                : schemaIsUnion(afterSchema)
                ? `request body changed to ${keyword}`
                : `request body changed from ${keyword}`;
            throw new RuleError({
              message: `${prefix} did not overlap with the previous schema. ${results.requestReasons.join(
                ', '
              )}`,
            });
          }
        }
      });

      requestAssertions.property.changed((before, after) => {
        const beforeSchema = before.raw;
        const afterSchema = after.raw;
        if (!beforeSchema || !afterSchema) return;
        if (schemaIsUnion(beforeSchema) || schemaIsUnion(afterSchema)) {
          const results = computeUnionTransition(beforeSchema, afterSchema);
          if (results.request) {
            const keyword =
              'oneOf' in beforeSchema || 'oneOf' in afterSchema
                ? 'oneOf'
                : 'anyOf';
            const prefix =
              schemaIsUnion(beforeSchema) && schemaIsUnion(afterSchema)
                ? `request property ${keyword} schema`
                : schemaIsUnion(afterSchema)
                ? `request property changed to ${keyword}`
                : `request property changed from ${keyword}`;

            throw new RuleError({
              message: `${prefix} did not overlap with the previous schema. ${results.requestReasons.join(
                ', '
              )}`,
            });
          }
        }
      });
    },
  });
