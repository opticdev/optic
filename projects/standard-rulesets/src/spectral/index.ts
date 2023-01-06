import { SpectralRule } from '@useoptic/rulesets-base';
import { Ruleset, Spectral } from '@stoplight/spectral-core';
import fs from 'fs';
import fetch from 'node-fetch';
// @ts-ignore
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';
import Ajv from 'ajv';
import { IChange, IFact, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
// import fetch from 'node-fetch';

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    added: {
      type: 'string',
    },
    always: {
      type: 'array',
      items: {
        type: 'string',
        description: 'URI of spectral ruleset file (file or URL)',
      },
    },
  },
};
const validateConfigSchema = ajv.compile(configSchema);

export class SpectralRulesets {
  constructor(
    private options: {
      spectralRules: Promise<SpectralRule>[];
    }
  ) {}

  async preparedRulesets() {
    return await Promise.all(this.options.spectralRules);
  }

  async runRules(inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document<{}>;
    currentJsonLike: OpenAPIV3.Document<{}>;
  }): Promise<Result[]> {
    const rulesets = await this.preparedRulesets();

    const allResults = await Promise.all(
      rulesets.map((ruleset) => ruleset.runRules(inputs))
    );

    return allResults.flat(1);
  }

  static fromOpticConfig(config: unknown): SpectralRulesets | string {
    const result = validateConfigSchema(config);

    if (!result && validateConfigSchema.errors) {
      return validateConfigSchema.errors
        .map((error) => {
          return `- ruleset/spectral${error.instancePath} ${error.message}`;
        })
        .join('\n- ');
    }
    const configValidated = config as { added?: string[]; always?: string[] };

    try {
      const always = (configValidated.always || []).map(
        async (ruleInput) =>
          new SpectralRule({
            name:
              'Spectral Rules applied to entire specification: ' + ruleInput,
            spectral: await uriToSpectral(ruleInput),
            applies: 'always',
          })
      );

      const added = (configValidated.added || []).map(
        async (ruleInput) =>
          new SpectralRule({
            name:
              'Spectral Rules from applied to additions to the specification: ' +
              ruleInput,
            spectral: await uriToSpectral(ruleInput),
            applies: 'always',
          })
      );

      return new SpectralRulesets({ spectralRules: [...added, ...always] });
    } catch (e) {
      return (e as Error).message;
    }
  }
}

async function uriToSpectral(uri: string) {
  const spectral = new Spectral();
  const ruleset: Ruleset = await bundleAndLoadRuleset(uri, { fs, fetch });
  // setting explicitly because of a poor choice in Spectral core. The instanceof is fragile when you load code / types from different modules and combine them (like we have to with bundle and core)
  // https://github.com/stoplightio/spectral/blob/a1bd6d29b473aff257dbf66264ebdf471fae07cc/packages/core/src/spectral.ts#L87
  spectral.ruleset = ruleset;
  return spectral;
}
