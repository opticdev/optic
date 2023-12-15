import path from 'path';
import { ConfigRuleset, OpticCliConfig } from '../../config';
import { StandardRulesets } from '@useoptic/standard-rulesets';
import {
  RuleRunner,
  Ruleset,
  prepareRulesets,
  ExternalRule,
} from '@useoptic/rulesets-base';
import { loadCliConfig } from '../../config';
import { logger } from '../../logger';
import chalk from 'chalk';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';

const injectedRulesets: (Ruleset | ExternalRule)[] = [];

export function setRulesets(rulesets: (Ruleset | ExternalRule)[]) {
  injectedRulesets.push(...rulesets);
}

const isLocalJsFile = (name: string) => name.endsWith('.js');

type InputPayload = Parameters<typeof prepareRulesets>[0];

const getStandardToUse = async (options: {
  specRuleset?: string;
  rulesetArg?: string;
  config: OpticCliConfig;
}): Promise<ConfigRuleset[] | undefined> => {
  // We always take the --ruleset arg as priority, then the ruleset on the API spec (from the head), then fallback to the optic.dev.yml config
  if (options.rulesetArg) {
    const config = await loadCliConfig(
      options.rulesetArg,
      options.config.client
    );
    return config.ruleset;
  } else if (options.specRuleset) {
    try {
      const ruleset = await options.config.client.getStandard(
        options.specRuleset
      );
      return ruleset.config.ruleset;
    } catch (e) {
      logger.warn(
        `${chalk.red('Warning:')} Could not download standard ${
          options.specRuleset
        }. Please check the ruleset name and whether you are authenticated (run: optic login).`
      );
      process.exitCode = 1;
      return [];
    }
  } else {
    return options.config.ruleset;
  }
};

export const generateRuleRunner = async (
  options: {
    specRuleset?: string;
    rulesetArg?: string;
    config: OpticCliConfig;
    specVersion: SupportedOpenAPIVersions;
  },
  checksEnabled: boolean
): Promise<{
  runner: RuleRunner;
  ruleNames: string[];
  warnings: string[];
  standard: ConfigRuleset[];
}> => {
  logger.debug('Initializing rule runner with the following options');
  logger.debug({
    options,
    checksEnabled,
  });
  let rulesets: (Ruleset | ExternalRule)[] = [];
  let ruleNames: string[] = [];
  let warnings: string[] = [];
  let standardUsed: ConfigRuleset[] = [];

  if (checksEnabled) {
    let defaultStandard: ConfigRuleset[] = [];
    if (injectedRulesets.length > 0) {
      logger.debug('Using injected rulesets from CLI bundle');
      rulesets.push(...injectedRulesets);
    } else {
      defaultStandard = [{ name: 'breaking-changes', config: {} }];
    }

    const standard = (await getStandardToUse(options)) ?? defaultStandard;
    standardUsed = standard;
    logger.debug({
      standard,
    });
    ruleNames.push(...standard.map((s) => s.name));

    const rulesToFetch: string[] = [];
    const localRulesets: InputPayload['localRulesets'] = {};
    const hostedRulesets: InputPayload['hostedRulesets'] = {};
    for (const rule of standard) {
      if (rule.name in StandardRulesets) {
        continue;
      } else if (isLocalJsFile(rule.name)) {
        const rootPath = options.config.configPath
          ? path.dirname(options.config.configPath)
          : process.cwd();
        localRulesets[rule.name] = path.resolve(rootPath, rule.name); // the path is the name
      } else {
        rulesToFetch.push(rule.name);
      }
    }
    const response =
      rulesToFetch.length > 0
        ? await options.config.client.getManyRulesetsByName(rulesToFetch)
        : { rulesets: [] };
    for (const hostedRuleset of response.rulesets) {
      if (hostedRuleset) {
        hostedRulesets[hostedRuleset.name] = {
          uploaded_at: hostedRuleset.uploaded_at,
          url: hostedRuleset.url,
        };
      }
    }

    logger.debug({
      rulesToFetch,
      localRulesets,
      hostedRulesets,
    });
    const results = await prepareRulesets(
      {
        ruleset: standard,
        localRulesets,
        standardRulesets: StandardRulesets,
        hostedRulesets,
      },
      {
        client: options.config.client,
        specVersion: options.specVersion,
      }
    );

    rulesets.push(...results.rulesets);

    warnings.push(...results.warnings);
  }

  return {
    runner: new RuleRunner(rulesets),
    ruleNames,
    warnings,
    standard: standardUsed,
  };
};
