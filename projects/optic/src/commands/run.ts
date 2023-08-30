import { Command } from 'commander';
import prompts from 'prompts';
import { OpticCliConfig, readUserConfig, VCS } from '../config';
import { errorHandler } from '../error-handler';
import { logger } from '../logger';
import { getNewTokenUrl } from '../utils/cloud-urls';
import open from 'open';
import { createOpticClient } from '../client/optic-backend';
import { handleTokenInput } from './login/login';

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
      '--match <match-glob>',
      'Filter OpenAPI specifications files with this glob pattern.'
    )
    .option(
      '--ignore <ignore-glob>',
      'Ignore OpenAPI specifications files with this glob pattern.'
    )
    .action(errorHandler(getRunAction(config), { command: 'run' }));
}

// to = current files
// from = cloud:<x>

/*
 * Check authentication:
 * - CI: valid token or exit 1
 * - interactive mode: logged in or trigger login flow (prompt for token, suggest opening web page to get one)
 * Find all spec files in repository directory (using --match and --ignore). If no spec is found, print links to guides and stop there.
 * Find latest cloud:<git-branch> version for each spec. Default to cloud:default if no spec was found for branch tag (notify user about this somehow). Default to empty spec if not found.
 * Diff + check all specs against cloud version. Use standards if configured.
 * Test specs for which capture is configured.
 * Upload spec versions and cloud run.
 * Report summary for each API: breaking changes, standards, capture tests.
 * Comment on PR if --comment is set
 */

type RunActionOptions = {
  match?: string;
  ignore?: string;
};

async function authenticateIT(config: OpticCliConfig) {
  const userConfig = await readUserConfig();
  if (userConfig?.token) return true;

  const { token } = await prompts(
    [
      {
        type: 'select',
        name: 'login',
        message: `This command requires a valid Optic token`,
        choices: [
          {
            title: 'Paste a token',
            value: 'paste',
          },
          {
            title: 'Get a token on app.useoptic.com',
            value: 'get',
          },
        ],
      },
      {
        type: 'password',
        name: 'token',
        message: 'Enter your token here:',
      },
    ],
    {
      onCancel: () => process.exit(1),
      onSubmit: (_, answer) => {
        if (answer === 'get') open(getNewTokenUrl(config.client.getWebBase()));
      },
    }
  );

  if (!token) {
    throw new Error('Expected token');
  }

  await handleTokenInput(token);
  return true;
}

async function authenticateCI() {
  throw new Error('not implemented'); // TODO
}

export const getRunAction =
  (config: OpticCliConfig) => async (options: RunActionOptions) => {
    if (config.vcs?.type !== VCS.Git) {
      logger.error(`Error: optic must be called from a git repository.`);
      process.exitCode = 1;
      return;
    }

    // TODO: handle unauthenticated
    config.isInCi ? await authenticateCI() : await authenticateIT(config);
  };
