import { Ruleset, RulesetConfig } from '@useoptic/rulesets-base';
import { preventOperationRemoval } from './preventOperationRemoval';
import { preventRequestPropertyRequired } from './preventRequestPropertyRequired';
import { preventRequestPropertyTypeChange } from './preventRequestPropertyTypeChange';
import { preventResponsePropertyOptional } from './preventResponsePropertyOptional';
import { preventResponsePropertyRemoval } from './preventResponsePropertyRemoval';
import { preventResponsePropertyTypeChange } from './preventResponsePropertyTypeChange';
import { preventResponseStatusCodeRemoval } from './preventResponseStatusCodeRemoval';
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
import Ajv from 'ajv';

type YamlConfig = {
  exclude_operations_with_extension?: string;
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    exclude_operations_with_extension: {
      type: 'string',
    },
  },
};
const validateConfigSchema = ajv.compile(configSchema);

const breakingChangesRules = [
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
  preventResponseStatusCodeRemoval,
];

type BreakingChangesRules = typeof breakingChangesRules;

export class BreakingChangesRuleset extends Ruleset<BreakingChangesRules> {
  static fromOpticConfig(config: unknown): BreakingChangesRuleset | string {
    const result = validateConfigSchema(config);

    if (!result) {
      return `- ${ajv.errorsText(validateConfigSchema.errors, {
        separator: '\n- ',
        dataVar: 'ruleset/breaking-changes',
      })}`;
    }

    const validatedConfig = config as YamlConfig;
    return new BreakingChangesRuleset();
  }

  constructor(
    config: Omit<RulesetConfig<BreakingChangesRules>, 'name' | 'rules'> = {}
  ) {
    super({
      ...config,
      name: 'Breaking changes ruleset',
      rules: breakingChangesRules,
    });
  }
}
