import { Operation, OperationAssertions, RuleContext } from '../types';

type OperationRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: OperationRule['matches'];
  rule: OperationRule['rule'];
};

export class OperationRule<RuleName extends string = string> {
  public name: RuleName;
  public docsLink?: string;
  public matches?: (operation: Operation, context: RuleContext) => boolean;
  public rule: (operation: OperationAssertions, context: RuleContext) => void;

  constructor(config: OperationRuleConfig<RuleName>) {
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
