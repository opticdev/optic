#!/usr/bin/env node

import { makeCiCli } from '@useoptic/api-checks';
import { readConfig } from './config';
import { buildCheckerFromConfig, CheckConfiguration } from './checker';
import { initializeRuleRunner } from './rule-runner';
import { Rule } from '@useoptic/rulesets-base';

// TODO RA-V2 - remove the check usage
const getRuleRunner = (rules?: Rule[], checks?: CheckConfiguration[]) => {
  // We should _only_ use the old checks if checks are defined, and rules are not defined
  if (!rules && checks) {
    // This is the deprecated rule runner
    return buildCheckerFromConfig(checks);
  }

  return initializeRuleRunner(rules || []);
};

(async () => {
  const config = await readConfig();

  const cli = makeCiCli(
    'optic-ci', // TODO deprecate this
    getRuleRunner(config.rules, config.checks),
    {
      opticToken: config.token,
      gitProvider: config.gitProvider,
      ciProvider: 'github',
    }
  );

  cli.parse(process.argv);
})();
