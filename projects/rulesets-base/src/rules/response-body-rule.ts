import { Severity, textToSev } from '@useoptic/openapi-utilities';
import { ResponseBody, ResponseBodyAssertions, RuleContext } from '../types';

type ResponseBodyRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: ResponseBodyRule['matches'];
  rule: ResponseBodyRule['rule'];
  severity?: 'info' | 'warn' | 'error';
};

export class ResponseBodyRule<RuleName extends string = string> {
  public type: 'response-body-rule';
  public name: RuleName;
  public docsLink?: string;
  public matches?: (response: ResponseBody, context: RuleContext) => boolean;
  public rule: (response: ResponseBodyAssertions, context: RuleContext) => void;
  public severity?: Severity;

  constructor(config: ResponseBodyRuleConfig<RuleName>) {
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
    this.type = 'response-body-rule';
    this.severity = config.severity && textToSev(config.severity);
  }

  static isInstance(v: any): v is ResponseBodyRule {
    return v?.type === 'response-body-rule';
  }
}
