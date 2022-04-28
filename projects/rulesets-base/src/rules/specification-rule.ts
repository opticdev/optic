import { Specification, SpecificationAssertions, RuleContext } from '../types';

type SpecificationRuleConfig = {
  name: string;
  docsLink?: string;
  matches?: (specification: Specification, context: RuleContext) => boolean;
  rule: (specification: SpecificationAssertions, context: RuleContext) => void;
};

export class SpecificationRule {
  public name: SpecificationRuleConfig['name'];
  public docsLink: SpecificationRuleConfig['docsLink'];
  public matches: SpecificationRuleConfig['matches'];
  public rule: SpecificationRuleConfig['rule'];

  constructor(config: SpecificationRuleConfig) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in SpecificationRule');
    }
    if (!config.rule) {
      throw new Error('Expected a rule definition in SpecificationRule');
    }
    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rule = config.rule;
  }
}
