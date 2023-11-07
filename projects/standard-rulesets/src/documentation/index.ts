import { Rule, Ruleset } from '@useoptic/rulesets-base';
import { SeverityTextOptions, SeverityText } from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import { appliesWhen } from './constants';
import { requireOperationDescription } from './requireOperationDescription';
import { requireOperationId } from './requireOperationId';
import { requireOperationSummary } from './requireOperationSummary';
import { requirePropertyDescription } from './requirePropertyDescriptions';

type RulesetConfig = {
  exclude_operations_with_extension?: string;
  docs_link?: string;
  require_property_descriptions?: boolean;
  require_operation_summary?: boolean;
  require_operation_description?: boolean;
  require_operation_id?: boolean;
  required_on?: (typeof appliesWhen)[number];
  severity?: SeverityText;
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    exclude_operations_with_extension: {
      type: 'string',
    },
    severity: {
      type: 'string',
      enum: SeverityTextOptions,
    },
    docs_link: {
      type: 'string',
    },
    require_property_descriptions: {
      type: 'boolean',
    },
    require_operation_summary: {
      type: 'boolean',
    },
    require_operation_description: {
      type: 'boolean',
    },
    require_operation_id: {
      type: 'boolean',
    },
    required_on: {
      type: 'string',
      enum: appliesWhen,
    },
  },
};

const validateConfigSchema = ajv.compile(configSchema);

export class DocumentationRuleset extends Ruleset {
  static async fromOpticConfig(
    config: unknown
  ): Promise<DocumentationRuleset | string> {
    const result = validateConfigSchema(config);

    if (!result) {
      return `- ${ajv.errorsText(validateConfigSchema.errors, {
        separator: '\n- ',
        dataVar: 'ruleset/naming',
      })}`;
    }

    const validatedConfig = config as RulesetConfig;
    let matches: Ruleset['matches'] | undefined = undefined;
    if (validatedConfig.exclude_operations_with_extension !== undefined) {
      const extension = validatedConfig.exclude_operations_with_extension;
      matches = (context) => (context.operation.raw as any)[extension] !== true;
    }
    return new DocumentationRuleset({
      required_on: validatedConfig.required_on ?? 'always',
      docsLink: validatedConfig.docs_link,
      matches,
      severity: validatedConfig.severity,
      require_property_descriptions:
        validatedConfig.require_property_descriptions,
      require_operation_summary: validatedConfig.require_operation_summary,
      require_operation_description:
        validatedConfig.require_operation_description,
      require_operation_id: validatedConfig.require_operation_id,
    });
  }

  constructor(config: {
    required_on: (typeof appliesWhen)[number];
    require_property_descriptions?: boolean;
    require_operation_summary?: boolean;
    require_operation_description?: boolean;
    require_operation_id?: boolean;
    docsLink?: string;
    matches?: Ruleset['matches'];
    severity?: SeverityText;
  }) {
    const rules: Rule[] = [];

    if (config.require_property_descriptions) {
      rules.push(requirePropertyDescription(config.required_on));
    }
    if (config.require_operation_summary) {
      rules.push(requireOperationSummary(config.required_on));
    }
    if (config.require_operation_description) {
      rules.push(requireOperationDescription(config.required_on));
    }
    if (config.require_operation_id) {
      rules.push(requireOperationId(config.required_on));
    }

    super({
      ...config,
      name: 'Documentation ruleset',
      rules: rules,
      matches: config.matches,
      docsLink: config.docsLink,
      severity: config.severity,
    });
  }
}
