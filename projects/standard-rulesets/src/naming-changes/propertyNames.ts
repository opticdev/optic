import { OpenApiKind } from '@useoptic/openapi-utilities';
import {
  FactVariantWithRaw,
  RequestRule,
  ResponseBodyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createPropertyNamingChecks = (
  applies: typeof appliesWhen[number],
  format: typeof casing[number]
) => {
  const caseCondition = `property must be ${format} ${
    applies === 'always' ? applies : `when ${applies}`
  }`;
  const propertyTest = (property: FactVariantWithRaw<OpenApiKind.Field>) => {
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
        requestAssertions.property.requirement(caseCondition, propertyTest);
      } else if (applies === 'addedOrChanged') {
        requestAssertions.property.added(caseCondition, propertyTest);
        requestAssertions.property.changed(caseCondition, (before, after) =>
          propertyTest(after)
        );
      } else if (applies === 'added') {
        requestAssertions.property.added(caseCondition, propertyTest);
      }
    },
  });

  const responsePropertyChecks = new ResponseBodyRule({
    name: 'response property naming check',
    rule: (responseAssertions) => {
      if (applies === 'always') {
        responseAssertions.property.requirement(caseCondition, propertyTest);
      } else if (applies === 'addedOrChanged') {
        responseAssertions.property.added(caseCondition, propertyTest);
        responseAssertions.property.changed(caseCondition, (before, after) =>
          propertyTest(after)
        );
      } else if (applies === 'added') {
        responseAssertions.property.added(caseCondition, propertyTest);
      }
    },
  });
  return [requestPropertyChecks, responsePropertyChecks];
};
