import { RequestBody, RequestAssertions, RuleContext } from '../types';

type RequestRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: RequestRule['matches'];
  rule: RequestRule['rule'];
};

export class RequestRule<RuleName extends string = string> {
  public name: RuleName;
  public docsLink?: string;
  public matches?: (request: RequestBody, context: RuleContext) => boolean;
  public rule: (request: RequestAssertions, context: RuleContext) => void;

  constructor(config: RequestRuleConfig<RuleName>) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in RequestRule');
    }
    if (!config.rule) {
      throw new Error('Expected a rule definition in RequestRule');
    }
    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rule = config.rule;
  }
}
