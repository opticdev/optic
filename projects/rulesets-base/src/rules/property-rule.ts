import { Property, PropertyAssertions, RuleContext } from '../types';

type PropertyRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: PropertyRule['matches'];
  rule: PropertyRule['rule'];
};

export class PropertyRule<RuleName extends string = string> {
  public type: 'property-rule';
  public name: RuleName;
  public docsLink?: string;
  public matches?: (operation: Property, context: RuleContext) => boolean;
  public rule: (operation: PropertyAssertions, context: RuleContext) => void;

  constructor(config: PropertyRuleConfig<RuleName>) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in PropertyRule');
    }
    if (!config.rule) {
      throw new Error('Expected a rule definition in PropertyRule');
    }
    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rule = config.rule;
    this.type = 'property-rule';
  }

  static isInstance(v: any): v is PropertyRule {
    return v?.type === 'property-rule';
  }
}
