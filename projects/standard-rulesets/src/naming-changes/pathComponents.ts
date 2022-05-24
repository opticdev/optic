import { OpenApiKind } from '@useoptic/openapi-utilities';
import {
  HeaderParameter,
  OperationRule,
  RuleError,
} from '@useoptic/rulesets-base';
import { casing, appliesWhen } from './constants';
import { isCase } from './isCase';

export const createPathComponentChecks = (
  applies: typeof appliesWhen[number],
  format: typeof casing[number]
) => {
  const caseCondition = `path component must be ${format} when ${applies}`;
  const check = (path: string) => {
    const pathComponents = path.split('/').filter(
      (component) =>
        // not empty
        component.length &&
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
        operationAssertions.requirement(caseCondition, (input) =>
          check(input.path)
        );
      } else if (applies === 'addedOrChanged') {
        operationAssertions.added(caseCondition, (input) => check(input.path));
        operationAssertions.changed(caseCondition, (input) =>
          check(input.path)
        );
      } else if (applies === 'added') {
        operationAssertions.added(caseCondition, (input) => check(input.path));
      }
    },
  });

  return pathComponentChecks;
};
