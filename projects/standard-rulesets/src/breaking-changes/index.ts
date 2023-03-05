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
  skip_when_major_version_changes?: boolean;
  docs_link?: string;
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    exclude_operations_with_extension: {
      type: 'string',
    },
    skip_when_major_version_changes: {
      type: 'boolean',
    },
    docs_link: {
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
  static async fromOpticConfig(
    config: unknown
  ): Promise<BreakingChangesRuleset | string> {
    const result = validateConfigSchema(config);

    if (!result) {
      return `- ${ajv.errorsText(validateConfigSchema.errors, {
        separator: '\n- ',
        dataVar: 'ruleset/breaking-changes',
      })}`;
    }

    const validatedConfig = config as YamlConfig;

    const shouldCheckSpecVersion = validatedConfig.hasOwnProperty(
      'skip_when_major_version_changes'
    )
      ? validatedConfig.skip_when_major_version_changes
      : true;

    const constructorConfig: Omit<
      RulesetConfig<BreakingChangesRules>,
      'name' | 'rules'
    > = {};
    constructorConfig.matches = (context) => {
      if (
        shouldCheckSpecVersion &&
        context.specification.versionChange === 'major'
      )
        return false;

      if (validatedConfig.exclude_operations_with_extension) {
        const extension = validatedConfig.exclude_operations_with_extension;
        return (context.operation.raw as any)[extension] !== true;
      }

      return true;
    };
    if (validatedConfig.docs_link !== undefined) {
      constructorConfig.docsLink = validatedConfig.docs_link;
    }

    return new BreakingChangesRuleset(constructorConfig);
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
