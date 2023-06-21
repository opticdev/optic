import { Command } from 'commander';
import { errorHandler } from '../../error-handler';
import { OpticCliConfig, VCS } from '../../config';
import { OPTIC_URL_KEY } from '../../constants';
import chalk from 'chalk';
import { logger } from '../../logger';
import { getOrganizationFromToken } from '../../utils/organization';
import * as Git from '../../utils/git-utils';
import prompts from 'prompts';
import { getApiUrl } from '../../utils/cloud-urls';

const usage = () => `
  optic api create <api_name>`;

const helpText = `
Example usage:
  Add an Optic API URL to a spec file.
  $ optic api create <api_name>
`;

export const registerApiCreate = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('create')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Generate an optic url to add to your specs')
    .argument('<name>', 'the name of the api')
    .action(
      errorHandler(getApiCreateAction(config), { command: 'api-create' })
    );
};

const getApiCreateAction = (config: OpticCliConfig) => async (name: string) => {
  if (!config.isAuthenticated) {
    logger.error(
      chalk.red(
        'You must be logged in to create an API in Optic Cloud. Please run "optic login"'
      )
    );
    process.exitCode = 1;
    return;
  }
  const orgRes = await getOrganizationFromToken(
    config.client,
    'Select the organization you want to create this API in'
  );
  if (!orgRes.ok) {
    logger.error(orgRes.error);
    process.exitCode = 1;
    return;
  }
  logger.info('');
  let default_branch: string = '';
  let default_tag: string | undefined = undefined;
  let web_url: string | undefined = undefined;

  logger.info('');

  if (config.vcs && config.vcs?.type === VCS.Git) {
    const maybeDefaultBranch = await Git.getDefaultBranchName();
    if (maybeDefaultBranch) {
      default_branch = maybeDefaultBranch;
      default_tag = `gitbranch:${default_branch}`;
    }
    const maybeOrigin = await Git.guessRemoteOrigin();
    if (maybeOrigin) {
      web_url = maybeOrigin.web_url;
    } else {
      logger.info(
        chalk.red(
          'Could not parse git origin details for where this repository lives.'
        )
      );
      const results = await prompts(
        [
          {
            message:
              'Do you want to enter the origin details manually? This will help optic link your specs back to your git hosting provider',
            type: 'confirm',

            name: 'add',
            initial: true,
          },
          {
            type: (prev) => (prev ? 'text' : null),
            message:
              'Enter the web url where this API is uploaded (example: https://github.com/opticdev/optic)',
            name: 'webUrl',
          },
        ],
        { onCancel: () => process.exit(1) }
      );
      if (results.webUrl) {
        web_url = results.webUrl;
      }
      logger.info('');
    }
  }

  const { id } = await config.client.createApi(orgRes.org.id, {
    name,
    default_branch,
    default_tag,
    web_url,
  });
  const url = getApiUrl(config.client.getWebBase(), orgRes.org.id, id);
  logger.info(`API created at ${url}`);
  logger.info('');

  logger.info(
    chalk.green(
      `Add this url to your spec under the '${OPTIC_URL_KEY}' key or run "optic spec add-api-url ${url}"`
    )
  );
};
