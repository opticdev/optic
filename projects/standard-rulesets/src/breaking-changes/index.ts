import { Rule, RuleContext, Ruleset } from '@useoptic/rulesets-base';
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
  preventPropertyEnumBreak,
} from './preventEnumBreak';
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
import { SeverityTextOptions, SeverityText } from '@useoptic/openapi-utilities';
import { preventRequestExpandingInUnionTypes } from './preventRequestExpandingWithUnionTypes';
import { preventResponseNarrowingInUnionTypes } from './preventResponseNarrowingWithUnionType';
import { excludeOperationWithExtensionMatches } from '../utils';

type YamlConfig = {
  exclude_operations_with_extension?: string | string[];
  skip_when_major_version_changes?: boolean;
  docs_link?: string;
  severity?: SeverityText;
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    exclude_operations_with_extension: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    },
    skip_when_major_version_changes: {
      type: 'boolean',
    },
    docs_link: {
      type: 'string',
    },
    severity: {
      type: 'string',
      enum: SeverityTextOptions,
    },
  },
};
const validateConfigSchema = ajv.compile(configSchema);

type ConstructorConfig = {
  severity?: SeverityText;
  matches?: (context: RuleContext) => boolean;
  docsLink?: string;
};

export class BreakingChangesRuleset extends Ruleset<Rule[]> {
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

    const constructorConfig: ConstructorConfig = {
      severity: validatedConfig.severity,
    };
    constructorConfig.matches = (context) => {
      if (
        shouldCheckSpecVersion &&
        context.specification.versionChange === 'major'
      )
        return false;

      if (validatedConfig.exclude_operations_with_extension) {
        return excludeOperationWithExtensionMatches(
          validatedConfig.exclude_operations_with_extension
        )(context);
      }

      return true;
    };
    if (validatedConfig.docs_link !== undefined) {
      constructorConfig.docsLink = validatedConfig.docs_link;
    }

    return new BreakingChangesRuleset(constructorConfig);
  }

  constructor(config: ConstructorConfig = {}) {
    const breakingChangesRules = [
      preventCookieParameterEnumBreak(),
      preventCookieParameterTypeChange(),
      preventHeaderParameterEnumBreak(),
      preventPropertyEnumBreak(),
      preventHeaderParameterTypeChange(),
      preventNewRequiredCookieParameter(),
      preventNewRequiredHeaderParameter(),
      preventNewRequiredQueryParameter(),
      preventOperationRemoval(),
      preventPathParameterEnumBreak(),
      preventPathParameterTypeChange(),
      preventQueryParameterEnumBreak(),
      preventQueryParameterTypeChange(),
      preventRequestPropertyRequired(),
      preventRequestPropertyTypeChange(),
      preventRequireExistingCookieParameter(),
      preventRequireExistingHeaderParameter(),
      preventRequireExistingQueryParameter(),
      preventResponsePropertyOptional(),
      preventResponsePropertyRemoval(),
      preventResponsePropertyTypeChange(),
      preventResponseStatusCodeRemoval(),
      preventRequestExpandingInUnionTypes(),
      preventResponseNarrowingInUnionTypes(),
    ];
    super({
      ...config,
      name: 'Breaking changes ruleset',
      rules: breakingChangesRules,
      severity: config.severity,
    });
  }
}
