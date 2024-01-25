import { Rule, RuleContext, Ruleset } from '@useoptic/rulesets-base';
import { SeverityTextOptions, SeverityText } from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import { appliesWhen } from './constants';
import {
  requireParameterExamples,
  requireRequestExamples,
  requireResponseExamples,
} from './requireExample';
import {
  defaultAjv,
  requirePropertyExamplesMatchSchema,
  requireValidParameterExamples,
  requireValidRequestExamples,
  requireValidResponseExamples,
} from './requireValidExamples';
import { excludeOperationWithExtensionMatches } from '../utils';

type SpecVersion = '3.1.x' | '3.0.x';

type YamlConfig = {
  exclude_operations_with_extension?: string | string[];
  docs_link?: string;
  require_request_examples?: boolean;
  require_response_examples?: boolean;
  require_parameter_examples?: boolean;
  required_on?: (typeof appliesWhen)[number];
  severity?: SeverityText;
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    exclude_operations_with_extension: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    },
    severity: {
      type: 'string',
      enum: SeverityTextOptions,
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

type ExampleConstructor = {
  docs_link?: string;
  require_request_examples?: boolean;
  require_response_examples?: boolean;
  require_parameter_examples?: boolean;
  required_on?: (typeof appliesWhen)[number];
  matches?: (context: RuleContext) => boolean;
  docsLink?: string;
  configureAjv?: (ajv: Ajv) => void;
  severity?: SeverityText;
  spec_version?: SpecVersion;
};

const validateConfigSchema = ajv.compile(configSchema);

export class ExamplesRuleset extends Ruleset {
  static async fromOpticConfig(
    config: unknown,
    { specVersion }: { specVersion?: SpecVersion } = {}
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
      spec_version: specVersion,
      severity: validatedConfig.severity,
    };

    if (validatedConfig.exclude_operations_with_extension !== undefined) {
      constructorConfig.matches = excludeOperationWithExtensionMatches(
        validatedConfig.exclude_operations_with_extension
      );
    }

    if (validatedConfig.docs_link !== undefined) {
      constructorConfig.docsLink = validatedConfig.docs_link;
    }

    return new ExamplesRuleset(constructorConfig);
  }

  constructor(config: ExampleConstructor) {
    const specVersion = config.spec_version ?? '3.1.x';
    const customAjv = defaultAjv(specVersion);
    if (config.configureAjv) {
      config.configureAjv(customAjv);
    }

    const rules: Rule[] = [
      requireValidResponseExamples(customAjv),
      requirePropertyExamplesMatchSchema(customAjv),
      requireValidParameterExamples(customAjv),
      requireValidRequestExamples(customAjv),
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
      severity: config.severity,
    });
  }
}
