import {
  Field,
  RequestRule,
  ResponseBodyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createPropertyNamingChecks = (
  applies: (typeof appliesWhen)[number],
  format: (typeof casing)[number]
) => {
  const propertyTest = (property: Field) => {
    if (!isCase(property.value.key, format)) {
      throw new RuleError({
        message: `${property.value.key} is not ${format}`,
      });
    }
  };

  const requestPropertyChecks = new RequestRule({
    name: 'request property naming check',
    rule: (requestAssertions) => {
      if (applies === 'always') {
        requestAssertions.property.requirement(propertyTest);
      } else if (applies === 'addedOrChanged') {
        requestAssertions.property.added(propertyTest);
        requestAssertions.property.changed((before, after) =>
          propertyTest(after)
        );
      } else if (applies === 'added') {
        requestAssertions.property.added(propertyTest);
      }
    },
  });

  const responsePropertyChecks = new ResponseBodyRule({
    name: 'response property naming check',
    rule: (responseAssertions) => {
      if (applies === 'always') {
        responseAssertions.property.requirement(propertyTest);
      } else if (applies === 'addedOrChanged') {
        responseAssertions.property.added(propertyTest);
        responseAssertions.property.changed((before, after) =>
          propertyTest(after)
        );
      } else if (applies === 'added') {
        responseAssertions.property.added(propertyTest);
      }
    },
  });
  return [requestPropertyChecks, responsePropertyChecks];
};
