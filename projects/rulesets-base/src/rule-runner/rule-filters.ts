import {
  Rule,
  Ruleset,
  SpecificationRule,
  OperationRule,
  RequestRule,
  ResponseBodyRule,
  ResponseRule,
  PropertyRule,
} from '../rules';
import { RuleContext } from '../types';

type RulesetData = {
  aliases: string[];
};

const getRulesetRuleId = (rulesetName: string, ruleName: string) =>
  `${rulesetName}:${ruleName}`;

const createRulesetMatcher =
  <T>({
    ruleMatcher: maybeRuleMatcher,
    rulesetMatcher: maybeRulesetMatcher,
  }: {
    ruleMatcher?: (item: T, ruleContext: RuleContext) => boolean;
    rulesetMatcher?: (ruleContext: RuleContext) => boolean;
  }) =>
  (item: T, ruleContext: RuleContext): boolean => {
    const ruleMatcher = maybeRuleMatcher || (() => true);
    const rulesetMatcher = maybeRulesetMatcher || (() => true);

    return ruleMatcher(item, ruleContext) && rulesetMatcher(ruleContext);
  };

const getRuleAliases = (rulesetName: string, ruleName: string): string[] => [
  getRulesetRuleId(rulesetName, ruleName),
  rulesetName,
];

export const getSpecificationRules = (
  rules: (Ruleset | Rule)[]
): (SpecificationRule & RulesetData)[] => {
  const specificationRules: (SpecificationRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (SpecificationRule.isInstance(ruleOrRuleset)) {
      specificationRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (SpecificationRule.isInstance(rule)) {
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

export const getOperationRules = (
  rules: (Ruleset | Rule)[]
): (OperationRule & RulesetData)[] => {
  const operationRules: (OperationRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (OperationRule.isInstance(ruleOrRuleset)) {
      operationRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (OperationRule.isInstance(rule)) {
          operationRules.push({
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

  return operationRules;
};

export const getRequestRules = (
  rules: (Ruleset | Rule)[]
): (RequestRule & RulesetData)[] => {
  const requestRules: (RequestRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (RequestRule.isInstance(ruleOrRuleset)) {
      requestRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (RequestRule.isInstance(rule)) {
          requestRules.push({
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

  return requestRules;
};

export const getResponseRules = (
  rules: (Ruleset | Rule)[]
): (ResponseRule & RulesetData)[] => {
  const responseRule: (ResponseRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ResponseRule.isInstance(ruleOrRuleset)) {
      responseRule.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (ResponseRule.isInstance(rule)) {
          responseRule.push({
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

  return responseRule;
};

export const getResponseBodyRules = (
  rules: (Ruleset | Rule)[]
): (ResponseBodyRule & RulesetData)[] => {
  const responseRule: (ResponseBodyRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ResponseBodyRule.isInstance(ruleOrRuleset)) {
      responseRule.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (ResponseBodyRule.isInstance(rule)) {
          responseRule.push({
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

  return responseRule;
};

export const getPropertyRules = (
  rules: (Ruleset | Rule)[]
): (PropertyRule & RulesetData)[] => {
  const propertyRules: (PropertyRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (PropertyRule.isInstance(ruleOrRuleset)) {
      propertyRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (PropertyRule.isInstance(rule)) {
          propertyRules.push({
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

  return propertyRules;
};
