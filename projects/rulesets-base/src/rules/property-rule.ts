import { Severity, textToSev } from '@useoptic/openapi-utilities';
import { Property, PropertyAssertions, RuleContext } from '../types';

type PropertyRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: PropertyRule['matches'];
  rule: PropertyRule['rule'];
  severity?: 'info' | 'warn' | 'error';
};

export class PropertyRule<RuleName extends string = string> {
  public type: 'property-rule';
  public name: RuleName;
  public docsLink?: string;
  public matches?: (property: Property, context: RuleContext) => boolean;
  public rule: (property: PropertyAssertions, context: RuleContext) => void;
  public severity?: Severity;

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
    this.severity = config.severity && textToSev(config.severity);
  }

  static isInstance(v: any): v is PropertyRule {
    return v?.type === 'property-rule';
  }
}
