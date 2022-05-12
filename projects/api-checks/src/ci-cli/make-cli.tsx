import { program as cli } from 'commander';
import { exec } from 'child_process';
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

export async function getProjectName(): Promise<string> {
  try {
    const stdout = new Promise<string>((resolve, reject) => {
      exec(
        'basename `git rev-parse --show-toplevel`',
        {
          cwd: process.cwd(),
        },
        (error, stdout) => {
          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        }
      );
    });
    return stdout;
  } catch (e) {
    return 'unknown-project';
  }
}

export async function makeCiCliWithNamedRules(
  rulesetServices: OpticCINamedRulesets,
  options: CliConfig = {},
  generateContext: () => Object = () => ({})
) {
  initSentry(packageJson.version);
  const projectName = await getProjectName();
  console.log(projectName);
  initSegment();
  trackEvent('optic-ci-run', projectName);

  cli.version(
    `for ${projectName}, running optic api-check ${packageJson.version}`
  );

  registerCreateContext(cli);
  registerCreateGithubContext(cli);
  registerCreateGitlabContext(cli);
  registerCreateManualContext(cli);
  registerCompare(cli, projectName, rulesetServices, options, generateContext);
  registerBulkCompare(
    cli,
    projectName,
    rulesetServices,
    options,
    generateContext
  );

  return cli;
}

export async function makeCiCli(
  checkService: RuleRunner,
  options: CliConfig = {},
  generateContext: () => Object = () => ({})
) {
  return makeCiCliWithNamedRules(
    { default: checkService },
    options,
    generateContext
  );
}
