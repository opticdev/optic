import { Severity, textToSev } from '@useoptic/openapi-utilities';
import { RequestBody, RequestAssertions, RuleContext } from '../types';

type RequestRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: RequestRule['matches'];
  rule: RequestRule['rule'];
  severity?: 'info' | 'warn' | 'error';
};

export class RequestRule<RuleName extends string = string> {
  public type: 'request-rule';
  public name: RuleName;
  public docsLink?: string;
  public matches?: (request: RequestBody, context: RuleContext) => boolean;
  public rule: (request: RequestAssertions, context: RuleContext) => void;
  public severity?: Severity;

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
    this.type = 'request-rule';
    this.severity = config.severity && textToSev(config.severity);
  }

  static isInstance(v: any): v is RequestRule {
    return v?.type === 'request-rule';
  }
}
