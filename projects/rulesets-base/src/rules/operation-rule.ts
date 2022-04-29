import { Operation, OperationAssertions, RuleContext } from '../types';

type OperationRuleConfig = {
  name: string;
  docsLink?: string;
  matches?: (operation: Operation, context: RuleContext) => boolean;
  rule: (operation: OperationAssertions, context: RuleContext) => void;
};

export class OperationRule {
  public name: OperationRuleConfig['name'];
  public docsLink: OperationRuleConfig['docsLink'];
  public matches: OperationRuleConfig['matches'];
  public rule: OperationRuleConfig['rule'];

  constructor(config: OperationRuleConfig) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in OperationRule');
    }
    if (!config.rule) {
      throw new Error('Expected a rule definition in OperationRule');
    }
    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rule = config.rule;
  }
}
