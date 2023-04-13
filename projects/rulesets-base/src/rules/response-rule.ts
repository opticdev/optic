import { Severity, textToSev } from '@useoptic/openapi-utilities';
import { Response, ResponseAssertions, RuleContext } from '../types';

type ResponseRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: ResponseRule['matches'];
  rule: ResponseRule['rule'];
  severity?: 'info' | 'warn' | 'error';
};

export class ResponseRule<RuleName extends string = string> {
  public type: 'response-rule';
  public name: RuleName;
  public docsLink?: string;
  public matches?: (response: Response, context: RuleContext) => boolean;
  public rule: (response: ResponseAssertions, context: RuleContext) => void;
  public severity: Severity;

  constructor(config: ResponseRuleConfig<RuleName>) {
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
    this.type = 'response-rule';
    this.severity = config.severity
      ? textToSev(config.severity)
      : Severity.Error;
  }

  static isInstance(v: any): v is ResponseRule {
    return v?.type === 'response-rule';
  }
}
