import { Response, ResponseAssertions, RuleContext } from '../types';

type ResponseRuleConfig = {
  name: string;
  docsLink?: string;
  matches?: (response: Response, context: RuleContext) => boolean;
  rule: (response: ResponseAssertions, context: RuleContext) => void;
};

export class ResponseRule {
  public name: ResponseRuleConfig['name'];
  public docsLink: ResponseRuleConfig['docsLink'];
  public matches: ResponseRuleConfig['matches'];
  public rule: ResponseRuleConfig['rule'];

  constructor(config: ResponseRuleConfig) {
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
