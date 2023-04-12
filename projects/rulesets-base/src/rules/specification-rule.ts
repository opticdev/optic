import { Severity } from '@useoptic/openapi-utilities';
import { Specification, SpecificationAssertions, RuleContext } from '../types';

type SpecificationRuleConfig<RuleName extends string> = {
  name: RuleName;
  docsLink?: string;
  matches?: SpecificationRule['matches'];
  rule: SpecificationRule['rule'];
  severity?: Severity;
};

export class SpecificationRule<RuleName extends string = string> {
  public type: 'specification-rule';
  public name: RuleName;
  public docsLink?: string;
  public matches?: (
    specification: Specification,
    context: RuleContext
  ) => boolean;
  public rule: (
    specification: SpecificationAssertions,
    context: RuleContext
  ) => void;
  public severity: Severity;

  constructor(config: SpecificationRuleConfig<RuleName>) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in SpecificationRule');
    }
    if (!config.rule) {
      throw new Error('Expected a rule definition in SpecificationRule');
    }
    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rule = config.rule;
    this.type = 'specification-rule';
    this.severity = config.severity ?? 'error';
  }

  static isInstance(v: any): v is SpecificationRule {
    return v?.type === 'specification-rule';
  }
}
