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
  preventNewRequiredHeaderParameter,
} from './preventNewRequiredParameter';
import {
  preventRequireExistingQueryParameter,
  preventRequireExistingCookieParameter,
  preventRequireExistingHeaderParameter,
} from './preventRequireExistingParameter';
import {
  preventQueryParameterTypeChange,
  preventCookieParameterTypeChange,
  preventPathParameterTypeChange,
  preventHeaderParameterTypeChange,
} from './preventParameterTypeChange';

const breakingChangeRules = [
  preventCookieParameterEnumBreak,
  preventCookieParameterTypeChange,
  preventHeaderParameterEnumBreak,
  preventHeaderParameterTypeChange,
  preventNewRequiredCookieParameter,
  preventNewRequiredHeaderParameter,
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
  preventRequireExistingQueryParameter,
  preventResponsePropertyOptional,
  preventResponsePropertyRemoval,
  preventResponsePropertyTypeChange,
];

type RuleNames<R extends Rule[]> = R[number]['name'];
type BreakingChangesRuleName = RuleNames<typeof breakingChangeRules>;

export class BreakingChangesRuleset extends Ruleset {
  constructor(
    config: {
      matches?: Ruleset['matches'];
      exemptions?: BreakingChangesRuleName[];
    } = {}
  ) {
    const { matches, exemptions = [] } = config;
    const notExemptedRules = breakingChangeRules.filter(
      (r) => !(exemptions as string[]).includes(r.name)
    );
    super({
      name: 'Breaking changes ruleset',
      matches,
      rules: notExemptedRules,
    });
  }
}

// Demo
new BreakingChangesRuleset({
  exemptions: [
    'prevent operation removal',
    'prevent removing response property',
  ],
});
