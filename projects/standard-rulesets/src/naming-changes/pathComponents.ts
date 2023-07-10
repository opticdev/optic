import { OperationRule, RuleError } from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createPathComponentChecks = (
  applies: (typeof appliesWhen)[number],
  format: (typeof casing)[number]
) => {
  const check = (path: string) => {
    const pathComponents = path.split('/').filter(
      (component) =>
        // not empty
        component.length > 0 &&
        // not a variable component
        !component.startsWith('{')
    );
    pathComponents.forEach((component) => {
      if (!isCase(component, format)) {
        throw new RuleError({
          message: `${component} is not ${format}`,
        });
      }
    });
  };

  const pathComponentChecks = new OperationRule({
    name: 'operation path component naming check',
    rule: (operationAssertions) => {
      if (applies === 'always') {
        operationAssertions.requirement((operation) => check(operation.path));
      } else if (applies === 'addedOrChanged') {
        operationAssertions.added((operation) => check(operation.path));
        operationAssertions.changed((operation) => check(operation.path));
      } else if (applies === 'added') {
        operationAssertions.added((operation) => check(operation.path));
      }
    },
  });

  return pathComponentChecks;
};
