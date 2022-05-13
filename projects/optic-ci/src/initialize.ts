import { makeCiCli } from '@useoptic/api-checks';
import { OpticConfiguration } from './config';
import { buildCheckerFromConfig, CheckConfiguration } from './checker';
import { initializeRuleRunner } from './rule-runner';
import { Rule, Ruleset } from '@useoptic/rulesets-base';

// TODO RA-V2 - remove the check usage
const getRuleRunner = (
  rules?: (Ruleset | Rule)[],
  checks?: CheckConfiguration[]
) => {
  // We should _only_ use the old checks if checks are defined, and rules are not defined
  if (!rules && checks) {
    // This is the deprecated rule runner
    return buildCheckerFromConfig(checks);
  }

  return initializeRuleRunner(rules || []);
};

export const initializeCli = (config: OpticConfiguration) => {
  return makeCiCli(
    getRuleRunner(config.rules, config.checks),
    {
      opticToken: config.token,
      gitProvider: config.gitProvider,
      ciProvider: 'github',
    },
    config.generateContext
  );
};
