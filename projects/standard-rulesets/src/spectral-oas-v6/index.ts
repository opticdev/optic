import { SpectralRule } from '@useoptic/rulesets-base';
import {
  Spectral,
  RulesetDefinition as SpectralRulesetDefinition,
} from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';
import Ajv from 'ajv';

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    applies: {
      type: 'string',
      enum: ['always', 'added', 'addedOrChanged', 'changed'],
    },
    rules: {},
  },
};
const validateConfigSchema = ajv.compile(configSchema);

export class SpectralOasV6Ruleset extends SpectralRule {
  constructor(options: {
    applies: 'added' | 'addedOrChanged' | 'changed' | 'always';
    spectral: Spectral;
  }) {
    super({
      name: 'SpectralOASV6',
      spectral: options.spectral,
      applies: options.applies,
    });
  }

  static fromOpticConfig(config: unknown): SpectralOasV6Ruleset | string {
    const result = validateConfigSchema(config);

    if (!result && validateConfigSchema.errors) {
      return validateConfigSchema.errors
        .map((error) => {
          const message =
            error.keyword === 'enum'
              ? `${error.message} ${error.params.allowedValues}`
              : error.message;
          return `- ruleset/spectral-oas-v6${error.instancePath} ${message}`;
        })
        .join('\n- ');
    }
    const configValidated = config as any;
    const applies = configValidated.applies ?? 'always';
    const rules = configValidated.rules ?? {};

    const spectral = new Spectral();
    try {
      spectral.setRuleset({
        extends: [[oas as SpectralRulesetDefinition, 'all']],
        rules,
      });

      return new SpectralOasV6Ruleset({
        applies,
        spectral,
      });
    } catch (e) {
      return (e as Error).message;
    }
  }
}
