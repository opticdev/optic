import { program as cli } from 'commander';
import { registerCompare } from './commands/compare';
import { registerBulkCompare } from './commands/bulk-compare';
import { initSentry } from './sentry';
import { initSegment, trackEvent } from './segment';
import { CliConfig } from './types';
import { OpticCINamedRulesets } from '../sdk/ruleset';
import {
  registerCreateContext,
  registerCreateGithubContext,
} from './commands/create-context/create-github-context';
import { registerCreateManualContext } from './commands/create-context/create-manual-context';
import { registerCreateGitlabContext } from './commands/create-context/create-gitlab-context';
import { RuleRunner } from '../types';
const packageJson = require('../../package.json');

export function makeCiCliWithNamedRules(
  forProject: string,
  rulesetServices: OpticCINamedRulesets,
  options: CliConfig = {},
  generateContext: () => Object = () => ({})
) {
  initSentry(packageJson.version);
  initSegment();
  trackEvent('optic-ci-run', forProject);

  cli.version(
    `for ${forProject}, running optic api-check ${packageJson.version}`
  );

  registerCreateContext(cli);
  registerCreateGithubContext(cli);
  registerCreateGitlabContext(cli);
  registerCreateManualContext(cli);
  registerCompare(cli, forProject, rulesetServices, options, generateContext);
  registerBulkCompare(
    cli,
    forProject,
    rulesetServices,
    options,
    generateContext
  );

  return cli;
}

export function makeCiCli(
  forProject: string,
  checkService: RuleRunner,
  options: CliConfig = {},
  generateContext: () => Object = () => ({})
) {
  return makeCiCliWithNamedRules(
    forProject,
    { default: checkService },
    options,
    generateContext
  );
}
