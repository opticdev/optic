import { Ruleset, Rule } from '@useoptic/rulesets-base';
import { preventOperationRemoval } from './preventOperationRemoval';
import { preventQueryParameterRequired } from './preventQueryParameterRequired';
import { preventQueryParameterTypeChange } from './preventQueryParameterTypeChange';
import { preventRequestPropertyRequired } from './preventRequestPropertyRequired';
import { preventRequestPropertyTypeChange } from './preventRequestPropertyTypeChange';
import { preventResponsePropertyOptional } from './preventResponsePropertyOptional';
import { preventResponsePropertyRemoval } from './preventResponsePropertyRemoval';
import { preventResponsePropertyTypeChange } from './preventResponsePropertyTypeChange';

const breakingChangeRules: Rule[] = [
  preventOperationRemoval,
  preventQueryParameterRequired,
  preventQueryParameterTypeChange,
  preventRequestPropertyRequired,
  preventRequestPropertyTypeChange,
  preventResponsePropertyOptional,
  preventResponsePropertyRemoval,
  preventResponsePropertyTypeChange,
];

export class BreakingChangesRuleset extends Ruleset {
  constructor(
    config: {
      matches?: Ruleset['matches'];
    } = {}
  ) {
    const { matches } = config;
    super({
      name: 'Breaking changes ruleset',
      matches,
      rules: breakingChangeRules,
    });
  }
}
