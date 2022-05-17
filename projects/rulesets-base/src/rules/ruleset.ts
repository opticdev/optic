import { OperationRule } from './operation-rule';
import { RequestRule } from './request-rule';
import { ResponseRule } from './response-rule';
import { ResponseBodyRule } from './response-body-rule';
import { SpecificationRule } from './specification-rule';
import { RuleContext } from '../types';

export type Rule =
  | SpecificationRule
  | OperationRule
  | RequestRule
  | ResponseRule
  | ResponseBodyRule;

type RulesetConfig = {
  name: Ruleset['name'];
  docsLink?: Ruleset['docsLink'];
  matches?: Ruleset['matches'];
  rules: Ruleset['rules'];
};

export class Ruleset {
  public name: string;
  public docsLink?: string;
  public matches?: (context: RuleContext) => boolean;
  public rules: Rule[];

  constructor(config: RulesetConfig) {
    // this could be invoked via javascript so we still to check
    if (!config.name) {
      throw new Error('Expected a name in Ruleset');
    }
    if (!config.rules) {
      throw new Error('Expected a rules array in Ruleset');
    }
    this.name = config.name;
    this.docsLink = config.docsLink;
    this.matches = config.matches;
    this.rules = config.rules;
  }
}
