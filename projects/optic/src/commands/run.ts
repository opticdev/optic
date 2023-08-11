import { Command, Option } from 'commander';
import { OpticCliConfig } from '../config';
import { errorHandler } from '../error-handler';

const usage = () => `
  optic run
`;

const helpText = `
Example usage:
  Run:
  $ optic run
`;

export function registerRunCommand(cli: Command, config: OpticCliConfig) {
  cli
    .command('run')
    .configureHelp({ commandUsage: usage })
    .addHelpText('after', helpText)
    .option(
      '-m, --match <match-glob>',
      'Filter OpenAPI specifications in your repository with this glob pattern. Leave empty to match all.'
    )
    .option(
      '-d, --diff <diff-base>',
      'Diff your specifications against provided base. Supports Git refs as well as optic cloud tags (e.g. "cloud:gitbranch:main").'
    )
    .option(
      '-c, --check',
      'Check your specifications for issues such as breaking changes.',
      false
    )
    .option(
      '-s, --standard <standard>',
      'Customize checks behaviour, including Spectral and forwards-only governance.'
    )
    .addOption(
      new Option(
        '-l, --level <level>',
        'Define the level at which Optic should exit with code. Possible values are "error", "warn" and "info".'
      )
        .choices(['error', 'warn', 'info'])
        .default('error')
    )
    .option(
      '-c, --comment',
      'Post a comment on your pull request when OpenAPI files changed. CI only.'
    )
    .option(
      '-p, --push',
      'Push specifications versions and check results to Optic cloud.'
    )
    .option(
      '-t, --tags <tags>',
      'Add those tags to your specifications in Optic cloud. "gitbranch:<current-branch>" and "git:<current-sha>" are included by default. Comma separated.'
    )
    .action(errorHandler(getRunAction(config), { command: 'run' }));
}

type RunActionOptions = {};

export const getRunAction =
  (config: OpticCliConfig) => async (options: RunActionOptions) => {
    console.log('run');
  };
