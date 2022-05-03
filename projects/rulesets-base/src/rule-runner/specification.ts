import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { createSpecification } from './data-constructors';
import { RulesetData, NodeDetail } from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createEmptyRuleContext,
} from './utils';

import { Ruleset, SpecificationRule } from '../rules';
import {
  createSpecificationAssertions,
  AssertionResult,
  assertionLifecycleToText,
} from './assertions';
import { Rule } from '../types';

const getSpecificationRules = (
  rules: Rule[]
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
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runSpecificationRules = ({
  specification,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specification: NodeDetail<OpenApiKind.Specification>;
  rules: Rule[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const results: Result[] = [];
  const specificationRules = getSpecificationRules(rules);
  const specificationRuleContext = createEmptyRuleContext(customRuleContext);
  const beforeSpecification = createSpecification(
    specification,
    'before',
    beforeApiSpec
  );
  const afterSpecification = createSpecification(
    specification,
    'after',
    afterApiSpec
  );
  for (const specificationRule of specificationRules) {
    if (beforeSpecification) {
      if (
        !specificationRule.matches ||
        specificationRule.matches(beforeSpecification, specificationRuleContext)
      ) {
        const specificationAssertions = createSpecificationAssertions();
        specificationRule.rule(
          specificationAssertions,
          specificationRuleContext
        );

        results.push(
          ...specificationAssertions
            .runBefore(beforeSpecification, specification.change)
            .map((assertionResult) =>
              createSpecificationResult(assertionResult, specificationRule)
            )
        );
      }
    }

    if (afterSpecification) {
      if (
        !specificationRule.matches ||
        specificationRule.matches(afterSpecification, specificationRuleContext)
      ) {
        const specificationAssertions = createSpecificationAssertions();
        specificationRule.rule(
          specificationAssertions,
          specificationRuleContext
        );

        results.push(
          ...specificationAssertions
            .runAfter(
              beforeSpecification,
              afterSpecification,
              specification.change
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
