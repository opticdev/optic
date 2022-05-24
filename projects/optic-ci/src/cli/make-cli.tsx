import { program as cli } from 'commander';
import { exec } from 'child_process';
import { registerCompare } from './commands/compare';
import { registerBulkCompare } from './commands/bulk-compare';
import { initSentry } from './sentry';
import { initSegment, trackEvent } from './segment';
import { CliConfig } from './types';
import {
  registerCreateContext,
  registerCreateGithubContext,
} from './commands/create-context/create-github-context';
import { registerCreateManualContext } from './commands/create-context/create-manual-context';
import { registerCreateGitlabContext } from './commands/create-context/create-gitlab-context';
import { RuleRunner, SpectralInput } from './types';
const packageJson = require('../../package.json');

export async function getProjectName(): Promise<string> {
  try {
    const stdoutPromise = new Promise<string>((resolve, reject) => {
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
    const stdout = await stdoutPromise;
    return stdout;
  } catch (e) {
    return 'unknown-project';
  }
}

export async function makeCiCli(
  checkService: RuleRunner,
  options: CliConfig = {},
  generateContext: () => Object = () => ({}),
  spectralConfig?: SpectralInput
) {
  initSentry(packageJson.version);
  const projectName = await getProjectName();
  initSegment();
  trackEvent('optic-ci-run', projectName);

  cli.version(
    `for ${projectName}, running optic api-check ${packageJson.version}`
  );

  registerCreateContext(cli);
  registerCreateGithubContext(cli);
  registerCreateGitlabContext(cli);
  registerCreateManualContext(cli);
  registerCompare(
    cli,
    projectName,
    checkService,
    options,
    generateContext,
    spectralConfig
  );
  registerBulkCompare(
    cli,
    projectName,
    checkService,
    options,
    generateContext,
    spectralConfig
  );

  return cli;
}
