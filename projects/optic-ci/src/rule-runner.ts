import { Rule, RuleRunner } from '@useoptic/rulesets-base';

export const initializeRuleRunner = (rules: Rule[]): RuleRunner => {
  return new RuleRunner(rules);
};
