import path from 'path';
import { OpticCliConfig } from '../../config';
import { StandardRulesets } from '@useoptic/standard-rulesets';
import { RuleRunner, Ruleset, prepareRulesets, ExternalRule } from '@useoptic/rulesets-base';
import { createOpticClient } from '@useoptic/optic-ci/build/cli/clients/optic-client';

const isLocalJsFile = (name: string) => name.endsWith('.js');

type InputPayload = Parameters<typeof prepareRulesets>[0];

export const generateRuleRunner = async (
  config: OpticCliConfig,
  checksEnabled: boolean
): Promise<RuleRunner> => {
  let rulesets: (Ruleset | ExternalRule)[] = [];

  if (checksEnabled) {
    const client = createOpticClient('');

    const rulesToFetch: string[] = [];
    const localRulesets: InputPayload['localRulesets'] = {};
    const hostedRulesets: InputPayload['hostedRulesets'] = {};
    for (const rule of config.ruleset) {
      if (rule.name in StandardRulesets) {
        continue;
      } else if (isLocalJsFile(rule.name)) {
        const rootPath = config.configPath
          ? path.dirname(config.configPath)
          : process.cwd();
        localRulesets[rule.name] = path.resolve(rootPath, rule.name); // the path is the name
      } else {
        rulesToFetch.push(rule.name);
      }
    }
    const response =
      rulesToFetch.length > 0
        ? await client.getManyRulesetsByName(rulesToFetch)
        : { rulesets: [] };
    for (const hostedRuleset of response.rulesets) {
      if (hostedRuleset) {
        hostedRulesets[hostedRuleset.name] = {
          uploaded_at: hostedRuleset.uploaded_at,
          url: hostedRuleset.url,
        };
      }
    }

    const results = await prepareRulesets({
      ruleset: config.ruleset,
      localRulesets,
      standardRulesets: StandardRulesets,
      hostedRulesets,
    });

    rulesets = results.rulesets;
    for (const warning of results.warnings) {
      console.error(warning);
    }
  }

  return new RuleRunner(rulesets);
};
