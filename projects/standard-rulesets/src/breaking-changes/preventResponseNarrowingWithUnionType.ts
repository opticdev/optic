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
            const keyword =
              'oneOf' in beforeSchema || 'oneOf' in afterSchema
                ? 'oneOf'
                : 'anyOf';
            const prefix =
              schemaIsUnion(beforeSchema) && schemaIsUnion(afterSchema)
                ? `response body ${keyword} schema`
                : schemaIsUnion(afterSchema)
                ? `response body changed to ${keyword}`
                : `response body changed from ${keyword}`;
            throw new RuleError({
              message: `${prefix} did not overlap with the previous schema: ${results.narrowedReasons.join(
                ', '
              )}`,
            });
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
            const keyword =
              'oneOf' in beforeSchema || 'oneOf' in afterSchema
                ? 'oneOf'
                : 'anyOf';
            const prefix =
              schemaIsUnion(beforeSchema) && schemaIsUnion(afterSchema)
                ? `response property ${keyword} schema`
                : schemaIsUnion(afterSchema)
                ? `response property changed to ${keyword}`
                : `response property changed from ${keyword}`;

            throw new RuleError({
              message: `${prefix} did not overlap with the previous schema: ${results.narrowedReasons.join(
                ', '
              )}`,
            });
          }
        }
      });
    },
  });
