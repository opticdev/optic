import { ResponseBody, ResponseBodyAssertions, RuleContext } from '../types';

type ResponseBodyRuleConfig = {
  name: string;
  docsLink?: string;
  matches?: (response: ResponseBody, context: RuleContext) => boolean;
  rule: (response: ResponseBodyAssertions, context: RuleContext) => void;
};

export class ResponseBodyRule {
  public name: ResponseBodyRuleConfig['name'];
  public docsLink: ResponseBodyRuleConfig['docsLink'];
  public matches: ResponseBodyRuleConfig['matches'];
  public rule: ResponseBodyRuleConfig['rule'];

  constructor(config: ResponseBodyRuleConfig) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in ResponseRule');
    }
    if (!config.rule) {
      throw new Error('Expected a rule definition in ResponseRule');
    }
    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rule = config.rule;
  }
}
