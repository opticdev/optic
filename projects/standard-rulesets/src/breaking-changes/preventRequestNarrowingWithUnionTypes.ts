import { RequestRule } from '@useoptic/rulesets-base';
import { schemaIsUnionProperty } from './helpers/unions';

export const preventRequestNarrowingInUnionTypes = new RequestRule({
  name: 'prevent narrowing in request union types',
  rule: (requestAssertions) => {
    requestAssertions.body.changed((before, after) => {
      if (
        schemaIsUnionProperty(before.raw) ||
        schemaIsUnionProperty(after.raw)
      ) {
        // create a set of before and after keys that are required and then do a set difference
      }
    });

    requestAssertions.property.changed((before, after) => {
      if (
        schemaIsUnionProperty(before.raw) ||
        schemaIsUnionProperty(after.raw)
      ) {
      }
    });
  },
});
