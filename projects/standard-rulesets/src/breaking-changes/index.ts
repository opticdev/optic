import { Ruleset, Rule } from '@useoptic/rulesets-base';
import { preventOperationRemoval } from './preventOperationRemoval';
import { preventRequestPropertyRequired } from './preventRequestPropertyRequired';
import { preventRequestPropertyTypeChange } from './preventRequestPropertyTypeChange';
import { preventResponsePropertyOptional } from './preventResponsePropertyOptional';
import { preventResponsePropertyRemoval } from './preventResponsePropertyRemoval';
import { preventResponsePropertyTypeChange } from './preventResponsePropertyTypeChange';
import {
  preventQueryParameterEnumBreak,
  preventCookieParameterEnumBreak,
  preventPathParameterEnumBreak,
  preventHeaderParameterEnumBreak,
} from './preventParameterEnumBreak';
import {
  preventQueryParameterRequired,
  preventCookieParameterRequired,
  preventPathParameterRequired,
  preventHeaderParameterRequired,
} from './preventParameterRequired';
import {
  preventQueryParameterTypeChange,
  preventCookieParameterTypeChange,
  preventPathParameterTypeChange,
  preventHeaderParameterTypeChange,
} from './preventParameterTypeChange';

const breakingChangeRules: Rule[] = [
  preventCookieParameterEnumBreak,
  preventCookieParameterRequired,
  preventCookieParameterTypeChange,
  preventHeaderParameterEnumBreak,
  preventHeaderParameterRequired,
  preventHeaderParameterTypeChange,
  preventOperationRemoval,
  preventPathParameterEnumBreak,
  preventPathParameterRequired,
  preventPathParameterTypeChange,
  preventQueryParameterEnumBreak,
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
