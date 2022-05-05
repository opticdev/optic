import { Rule, Ruleset, RuleRunner } from '@useoptic/rulesets-base';

export const initializeRuleRunner = (rules: (Ruleset | Rule)[]): RuleRunner => {
  return new RuleRunner(rules);
};
