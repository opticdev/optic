import { Command } from 'commander';
import prompts from 'prompts';
import fs from 'node:fs/promises';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import { OpticCliConfig, USER_CONFIG_PATH, readUserConfig } from '../../config';
import { logger } from '../../logger';
import chalk from 'chalk';
import { OPTIC_LOGIN_PAT_LINK } from '../../constants';

export const registerLogin = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('login')
    .description('Login to Optic')
    .action(wrapActionHandlerWithSentry(getLoginAction(config)));
};

const getLoginAction = (config: OpticCliConfig) => async () => {
  const userConfig = await readUserConfig();
  if (userConfig?.token) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message:
        'It appears you are already logged in, would you like to continue? Continuing will overwrite the old login credentials',
    });
    if (!overwrite) {
      return;
    }
  }

  logger.info(`${chalk.blue('Generate a token below')}

Create an account and generate a personal access token at ${OPTIC_LOGIN_PAT_LINK}.

Once you've created a token, enter it below.
  
`);

  const response = await prompts({
    type: 'password',
    name: 'token',
    message: 'Enter your token here:',
  });

  const newConfig = userConfig
    ? {
        ...userConfig,
        token: response.token,
      }
    : {
        token: response.token,
      };
  await fs.writeFile(USER_CONFIG_PATH, JSON.stringify(newConfig), 'utf-8');

  logger.info(chalk.green(`Successfully saved config to ${USER_CONFIG_PATH}`));
};
