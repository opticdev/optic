import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { createSpecification } from './data-constructors';
import { RulesetData, NodeDetail } from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createRuleContext,
  isExempted,
} from './utils';

import { Rule, Ruleset, SpecificationRule } from '../rules';
import {
  createSpecificationAssertions,
  AssertionResult,
  assertionLifecycleToText,
} from './assertions';

const getSpecificationRules = (
  rules: (Ruleset | Rule)[]
): (SpecificationRule & RulesetData)[] => {
  const specificationRules: (SpecificationRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ruleOrRuleset instanceof SpecificationRule) {
      specificationRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (ruleOrRuleset instanceof Ruleset) {
      for (const rule of ruleOrRuleset.rules) {
        if (rule instanceof SpecificationRule) {
          specificationRules.push({
            ...rule,
            matches: createRulesetMatcher({
              ruleMatcher: rule.matches,
              rulesetMatcher: ruleOrRuleset.matches,
            }),
            aliases: getRuleAliases(ruleOrRuleset.name, rule.name),
            docsLink: rule.docsLink || ruleOrRuleset.docsLink,
          });
        }
      }
    }
  }

  return specificationRules;
};

const createSpecificationResult = (
  assertionResult: AssertionResult,
  rule: SpecificationRule
): Result => ({
  where: `${assertionLifecycleToText(assertionResult.type)} specification`,
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
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
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
      const rulesContext = createRuleContext({
        specification: beforeSpecification,
        specificationNode: specificationNode,
        custom: customRuleContext,
      });

      const matches =
        !specificationRule.matches ||
        specificationRule.matches(beforeSpecification, rulesContext);

      const exempted = isExempted(
        beforeSpecification.raw,
        specificationRule.name
      );

      if (matches) {
        const specificationAssertions = createSpecificationAssertions();
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
      const rulesContext = createRuleContext({
        specification: afterSpecification,
        specificationNode: specificationNode,
        custom: customRuleContext,
      });

      const matches =
        !specificationRule.matches ||
        specificationRule.matches(afterSpecification, rulesContext);

      const exempted = isExempted(
        afterSpecification.raw,
        specificationRule.name
      );
      if (matches) {
        const specificationAssertions = createSpecificationAssertions();
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
