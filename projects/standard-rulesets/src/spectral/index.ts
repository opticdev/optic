import { SpectralRule } from '@useoptic/rulesets-base';
import { Ruleset, Spectral } from '@stoplight/spectral-core';
import fetch from 'node-fetch';
// @ts-ignore
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/dist/loader/node';
import Ajv from 'ajv';
import { IChange, IFact, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import { ExternalRuleBase } from '@useoptic/rulesets-base/build/rules/external-rule-base';
import { URL } from 'url';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';

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

export class SpectralRulesets extends ExternalRuleBase {
  constructor(
    private options: {
      spectralRules: SpectralRule[];
    }
  ) {
    super();
  }

  async runRules(inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document<{}>;
    currentJsonLike: OpenAPIV3.Document<{}>;
  }): Promise<Result[]> {
    const allResults = await Promise.all(
      this.options.spectralRules.map((ruleset) => ruleset.runRules(inputs))
    );

    return allResults.flat(1);
  }
  static async fromOpticConfig(
    config: unknown
  ): Promise<SpectralRulesets | string> {
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

      return new SpectralRulesets({
        spectralRules: await Promise.all([...added, ...always]),
      });
    } catch (e) {
      return (e as Error).message;
    }
  }
}

function isUrl(uri: string) {
  try {
    new URL(uri);
    return true;
  } catch (e) {
    return false;
  }
}
async function fileExits(path: string) {
  return new Promise((resolve, reject) => {
    fs.access(path, fs.constants.R_OK, (err) => {
      resolve(Boolean(err));
    });
  });
}

async function uriToSpectral(uri: string) {
  const spectral = new Spectral();

  if ((isUrl(uri) && uri.endsWith('yml')) || uri.endsWith('yaml')) {
    const tmpFile = path.join(
      os.tmpdir(),
      (Math.random() + 1).toString(36).substring(7) + '.yml'
    );

    const fetchUri = await fetch(uri);
    const loadedData = await fetchUri.text();
    await fs.writeFile(tmpFile, loadedData);
    const ruleset: Ruleset = await bundleAndLoadRuleset(tmpFile, { fs, fetch });
    spectral.ruleset = ruleset;
    return spectral;
  } else {
    let loadUri = uri;

    if (!isUrl(uri)) {
      const filePath = path.resolve(uri);
      const fileDoesExist = await fileExits(filePath);
      if (fileDoesExist) {
        loadUri = filePath;
      }
    }

    const ruleset: Ruleset = await bundleAndLoadRuleset(loadUri, { fs, fetch });
    // setting explicitly because of a poor choice in Spectral core. The instanceof is fragile when you load code / types from different modules and combine them (like we have to with bundle and core)
    // https://github.com/stoplightio/spectral/blob/a1bd6d29b473aff257dbf66264ebdf471fae07cc/packages/core/src/spectral.ts#L87
    spectral.ruleset = ruleset;
    return spectral;
  }
}
