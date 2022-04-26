import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { createSpecification } from './data-constructors';
import { Rules, RulesetData, NodeDetail } from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createEmptyRuleContext,
} from './utils';

import { Ruleset, SpecificationRule } from '../rules';

const getSpecificationRules = (
  rules: Rules[]
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

export const runSpecificationRules = ({
  specification,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specification: NodeDetail<OpenApiKind.Specification>;
  rules: Rules[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const result: Result[] = [];
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
        // TODO pass in assertions + catch rule errors
        // TODO create helper for this
        // specificationRule.rule()
      }
    }

    if (afterSpecification) {
      if (
        !specificationRule.matches ||
        specificationRule.matches(afterSpecification, specificationRuleContext)
      ) {
        // TODO pass in assertions + catch rule errors
        // specificationRule.rule()
      }
    }
  }

  return result;
};
