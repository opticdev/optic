import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { createSpecification } from './data-constructors';
import { NodeDetail } from './rule-runner-types';
import { createRuleContextWithoutOperation, isExempted } from './utils';

import { Rule, Ruleset, SpecificationRule } from '../rules';
import { createSpecificationAssertions, AssertionResult } from './assertions';
import { getSpecificationRules } from './rule-filters';
import { OpenAPIDocument } from '..';

const createSpecificationResult = (
  assertionResult: AssertionResult,
  rule: SpecificationRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `specification`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  exempted: assertionResult.exempted,
  received: assertionResult.received,
  expected: assertionResult.expected,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runSpecificationRules = ({
  specificationNode,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specificationNode: NodeDetail<OpenApiKind.Specification>;
  rules: (Ruleset | Rule)[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIDocument;
  afterApiSpec: OpenAPIDocument;
}) => {
  const results: Result[] = [];
  const specificationRules = getSpecificationRules(rules);

  const beforeSpecification = createSpecification(
    specificationNode,
    'before',
    beforeApiSpec
  );
  const afterSpecification = createSpecification(
    specificationNode,
    'after',
    afterApiSpec
  );

  for (const specificationRule of specificationRules) {
    // rules that are triggered and use the data from the `before` specification are: `removed`
    if (beforeSpecification) {
      const rulesContext = createRuleContextWithoutOperation(
        {
          before: beforeSpecification,
          after: afterSpecification,
          node: specificationNode,
        },
        customRuleContext
      );

      const matches =
        !specificationRule.matches ||
        specificationRule.matches(beforeSpecification, rulesContext);

      const exempted = isExempted(
        beforeSpecification.raw,
        specificationRule.name
      );

      if (matches) {
        const specificationAssertions = createSpecificationAssertions(
          specificationRule.severity
        );
        // Register the user's rule definition, this is collected in the specificationAssertions object
        specificationRule.rule(specificationAssertions, rulesContext);

        // Run the user's rules that have been stored in specificationAssertions
        results.push(
          ...specificationAssertions
            .runBefore(beforeSpecification, specificationNode.change, exempted)
            .map((assertionResult) =>
              createSpecificationResult(assertionResult, specificationRule)
            )
        );
      }
    }

    if (afterSpecification) {
      const rulesContext = createRuleContextWithoutOperation(
        {
          before: beforeSpecification,
          after: afterSpecification,
          node: specificationNode,
        },
        customRuleContext
      );

      const matches =
        !specificationRule.matches ||
        specificationRule.matches(afterSpecification, rulesContext);

      const exempted = isExempted(
        afterSpecification.raw,
        specificationRule.name
      );
      if (matches) {
        const specificationAssertions = createSpecificationAssertions(
          specificationRule.severity
        );
        // Register the user's rule definition, this is collected in the specificationAssertions object
        specificationRule.rule(specificationAssertions, rulesContext);

        // Run the user's rules that have been stored in specificationAssertions
        results.push(
          ...specificationAssertions
            .runAfter(
              beforeSpecification,
              afterSpecification,
              specificationNode.change,
              exempted
            )
            .map((assertionResult) =>
              createSpecificationResult(assertionResult, specificationRule)
            )
        );
      }
    }
  }

  return results;
};
