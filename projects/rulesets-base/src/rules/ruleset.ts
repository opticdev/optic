import { OperationRule } from './operation-rule';
import { RequestRule } from './request-rule';
import { ResponseRule } from './response-rule';
import { ResponseBodyRule } from './response-body-rule';
import { SpecificationRule } from './specification-rule';
import { PropertyRule } from './property-rule';
import { RuleContext } from '../types';
import { ExternalRuleBase } from './external-rule-base';
import { SeverityText, textToSev } from '@useoptic/openapi-utilities';

export type Rule =
  | SpecificationRule
  | OperationRule
  | RequestRule
  | ResponseRule
  | ResponseBodyRule
  | PropertyRule;

export type ExternalRule = ExternalRuleBase;

export type RuleNames<R extends Rule[]> = R[number]['name'];

export type RulesetConfig<Rules extends Rule[]> = {
  /**
   * A name for this ruleset
   */
  name: string;

  /**
   * A link to your API standards (will direct users here when rule fails)
   */
  docsLink?: string;

  /**
   * A function do determine whether to run the rule or not, based on context
   */
  matches?: (context: RuleContext) => boolean;

  /**
   * A list of Rules that will be checked against your OpenAPI changes
   */
  rules: Rules;

  /**
   * A list of rules from the ruleset to ignore, by name.
   */
  skipRules?: RuleNames<Rules>[];

  /**
   * A subset of rules from the ruleset to use exclusively, by name.
   */
  rulesOnly?: RuleNames<Rules>[];

  severity?: SeverityText;
};

export class Ruleset<Rules extends Rule[] = Rule[]> {
  public type: 'ruleset';
  public name: string;
  public docsLink?: string;
  public matches?: (context: RuleContext) => boolean;
  public rules: Rule[];

  constructor(config: RulesetConfig<Rules>) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in Ruleset');
    }
    if (!config.rules) {
      throw new Error('Expected a rules array in Ruleset');
    }
    const skipRules = config.skipRules ?? [];
    const rulesOnly = config.rulesOnly;

    const rules = config.rules
      .filter((r) => !rulesOnly || rulesOnly.includes(r.name))
      .filter((r) => !skipRules.includes(r.name));

    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rules = rules;
    this.type = 'ruleset';

    if (config.severity !== undefined) {
      const configSev = config.severity;
      this.rules = this.rules.map((r) => {
        const sev =
          r.severity === undefined
            ? (r.severity = textToSev(configSev))
            : r.severity;
        return {
          ...r,
          severity: sev,
        };
      });
    }
  }

  static isInstance(v: any): v is Ruleset {
    return v?.type === 'ruleset';
  }
}
