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
  preventNewRequiredQueryParameter,
  preventNewRequiredCookieParameter,
  preventNewRequiredPathParameter,
  preventNewRequiredHeaderParameter,
} from './preventNewRequiredParameter';
import {
  preventRequireExistingQueryParameter,
  preventRequireExistingCookieParameter,
  preventRequireExistingPathParameter,
  preventRequireExistingHeaderParameter,
} from './preventRequireExistingParameter';
import {
  preventQueryParameterTypeChange,
  preventCookieParameterTypeChange,
  preventPathParameterTypeChange,
  preventHeaderParameterTypeChange,
} from './preventParameterTypeChange';

const breakingChangeRules: Rule[] = [
  preventCookieParameterEnumBreak,
  preventCookieParameterTypeChange,
  preventHeaderParameterEnumBreak,
  preventHeaderParameterTypeChange,
  preventNewRequiredCookieParameter,
  preventNewRequiredHeaderParameter,
  preventNewRequiredPathParameter,
  preventNewRequiredQueryParameter,
  preventOperationRemoval,
  preventPathParameterEnumBreak,
  preventPathParameterTypeChange,
  preventQueryParameterEnumBreak,
  preventQueryParameterTypeChange,
  preventRequestPropertyRequired,
  preventRequestPropertyTypeChange,
  preventRequireExistingCookieParameter,
  preventRequireExistingHeaderParameter,
  preventRequireExistingPathParameter,
  preventRequireExistingQueryParameter,
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
