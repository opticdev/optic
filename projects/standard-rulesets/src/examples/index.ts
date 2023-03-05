import {
  Rule,
  RuleContext,
  Ruleset,
  RulesetConfig,
} from '@useoptic/rulesets-base';
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
  exclude_operations_with_extension?: string;
  docs_link?: string;
  require_request_examples?: boolean;
  require_response_examples?: boolean;
  require_parameter_examples?: boolean;
  required_on?: typeof appliesWhen[number];
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    exclude_operations_with_extension: {
      type: 'string',
    },
    docs_link: {
      type: 'string',
    },
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

type ExampleConstructor = YamlConfig & {
  matches?: (context: RuleContext) => boolean;
  docsLink?: string;
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
    const constructorConfig: ExampleConstructor = {
      ...validatedConfig,
    };

    if (validatedConfig.exclude_operations_with_extension !== undefined) {
      const extension = validatedConfig.exclude_operations_with_extension;
      constructorConfig.matches = (context) =>
        (context.operation.raw as any)[extension] !== true;
    }

    if (validatedConfig.docs_link !== undefined) {
      constructorConfig.docsLink = validatedConfig.docs_link;
    }

    return new ExamplesRuleset(validatedConfig);
  }

  constructor(config: ExampleConstructor) {
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
      matches: config.matches,
      docsLink: config.docsLink,
    });
  }
}
