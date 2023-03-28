import { SpectralRule } from '@useoptic/rulesets-base';
import Ajv from 'ajv';
import {
  IChange,
  IFact,
  ObjectDiff,
  OpenAPIV3,
  Result,
  RuleResult,
} from '@useoptic/openapi-utilities';
import { ExternalRuleBase } from '@useoptic/rulesets-base/build/rules/external-rule-base';
import path from 'path';
import os from 'os';
import fs from 'node:fs/promises';

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    added: {
      type: 'array',
      items: {
        type: 'string',
        description: 'URI of spectral ruleset file (file or URL)',
      },
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
      always: string[];
      added: string[];
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
    const absolutePathTmpSpec = path.join(
      os.tmpdir(),
      `optic-next-spec-${Math.floor(Math.random() * 100000)}.json`
    );

    // write one tmp spec for all the spectral runs to use
    await fs.writeFile(
      absolutePathTmpSpec,
      JSON.stringify(inputs.nextJsonLike)
    );

    const added = this.options.added.map((ruleInput) => {
      return new SpectralRule({
        name:
          'Spectral Rules applied to additions to the specification: ' +
          ruleInput,
        flatSpecFile: absolutePathTmpSpec,
        applies: 'added',
        rulesetPointer: ruleInput,
      });
    });
    const always = this.options.always.map((ruleInput) => {
      return new SpectralRule({
        name: 'Spectral Rules applied to entire specification: ' + ruleInput,
        flatSpecFile: absolutePathTmpSpec,
        applies: 'always',
        rulesetPointer: ruleInput,
      });
    });

    const allRulesets = [...always, ...added];

    const allResults = await Promise.all(
      allRulesets.map((ruleset) => ruleset.runRules(inputs))
    );

    // remove tmp spec
    await fs.unlink(absolutePathTmpSpec);

    return allResults.flat(1);
  }

  async runRulesV2(inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: OpenAPIV3.Document;
    toSpec: OpenAPIV3.Document;
  }): Promise<RuleResult[]> {
    const absolutePathTmpSpec = path.join(
      os.tmpdir(),
      `optic-next-spec-${Math.floor(Math.random() * 100000)}.json`
    );

    // write one tmp spec for all the spectral runs to use
    await fs.writeFile(absolutePathTmpSpec, JSON.stringify(inputs.toSpec));

    const added = this.options.added.map((ruleInput) => {
      return new SpectralRule({
        name:
          'Spectral Rules applied to additions to the specification: ' +
          ruleInput,
        flatSpecFile: absolutePathTmpSpec,
        applies: 'added',
        rulesetPointer: ruleInput,
      });
    });
    const always = this.options.always.map((ruleInput) => {
      return new SpectralRule({
        name: 'Spectral Rules applied to entire specification: ' + ruleInput,
        flatSpecFile: absolutePathTmpSpec,
        applies: 'always',
        rulesetPointer: ruleInput,
      });
    });

    const allRulesets = [...always, ...added];

    const allResults = await Promise.all(
      allRulesets.map((ruleset) => ruleset.runRulesV2(inputs))
    );

    // remove tmp spec
    await fs.unlink(absolutePathTmpSpec);

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

    return new SpectralRulesets({
      added: configValidated.added ?? [],
      always: configValidated.always ?? [],
    });
  }
}
