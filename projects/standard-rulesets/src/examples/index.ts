import { Rule, Ruleset } from '@useoptic/rulesets-base';
import Ajv from 'ajv';
import { appliesWhen } from './constants';
import {
  requireParameterExamples,
  requireRequestExamples,
  requireResponseExamples,
} from './requireExample';
import {
  requirePropertyExamplesMatchSchema,
  requireValidParameterExamples,
  requireValidRequestExamples,
  requireValidResponseExamples,
} from './requireValidExamples';

type YamlConfig = {
  require_request_examples?: boolean;
  require_response_examples?: boolean;
  require_parameter_examples?: boolean;
  required_on?: typeof appliesWhen[number];
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    require_request_examples: {
      type: 'boolean',
    },
    require_response_examples: {
      type: 'boolean',
    },
    require_parameter_examples: {
      type: 'boolean',
    },
    required_on: {
      type: 'string',
      enum: appliesWhen,
    },
  },
};

const validateConfigSchema = ajv.compile(configSchema);

export class ExamplesRuleset extends Ruleset {
  static async fromOpticConfig(
    config: unknown
  ): Promise<ExamplesRuleset | string> {
    const result = validateConfigSchema(config);

    if (!result) {
      return `- ${ajv.errorsText(validateConfigSchema.errors, {
        separator: '\n- ',
        dataVar: 'ruleset/examples',
      })}`;
    }

    const validatedConfig = config as YamlConfig;

    return new ExamplesRuleset(validatedConfig);
  }

  constructor(config: YamlConfig = {}) {
    const rules: Rule[] = [
      requireValidResponseExamples,
      requirePropertyExamplesMatchSchema,
      requireValidParameterExamples,
      requireValidRequestExamples,
    ];

    if (config.require_response_examples)
      rules.push(requireResponseExamples(config.required_on || 'always'));

    if (config.require_request_examples)
      rules.push(requireRequestExamples(config.required_on || 'always'));

    if (config.require_parameter_examples)
      rules.push(requireParameterExamples(config.required_on || 'always'));

    super({
      ...config,
      name: 'Examples ruleset',
      rules: rules,
    });
  }
}
