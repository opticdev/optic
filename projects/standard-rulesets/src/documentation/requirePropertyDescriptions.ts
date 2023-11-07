import { PropertyRule, RuleError } from '@useoptic/rulesets-base';
import { appliesWhen } from './constants';

export const requirePropertyDescription = (
  applies: (typeof appliesWhen)[number]
) =>
  new PropertyRule({
    name: 'require property description',
    rule: (propertyAssertions) => {
      const lifecycle = applies === 'always' ? 'requirement' : applies;
      propertyAssertions[lifecycle]((property) => {
        if (!property.raw.description) {
          throw new RuleError({
            message: `an property description must be included`,
          });
        }
      });
    },
  });
