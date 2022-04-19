import { Request, RequestAssertions, RuleContext } from '../types';

type RequestRuleConfig = {
  name: string;
  docsLink?: string;
  matches?: (request: Request, context: RuleContext) => boolean;
  rule: (request: RequestAssertions, context: RuleContext) => void;
};

export class RequestRule {
  public name: RequestRuleConfig['name'];
  public docsLink: RequestRuleConfig['docsLink'];
  public matches: RequestRuleConfig['matches'];
  public rule: RequestRuleConfig['rule'];

  constructor(config: RequestRuleConfig) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in RequestRule');
    }
    if (!config.matches) {
      throw new Error('Expected a matches object in RequestRule');
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
