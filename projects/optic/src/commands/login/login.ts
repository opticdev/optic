import { Command } from 'commander';
import prompts from 'prompts';
import path from 'path';
import fs from 'node:fs/promises';
import open from 'open';

import { OpticCliConfig, USER_CONFIG_PATH, readUserConfig } from '../../config';
import { logger } from '../../logger';
import chalk from 'chalk';
import { getNewTokenUrl } from '../../utils/cloud-urls';
import { errorHandler } from '../../error-handler';
import { createOpticClient } from '../../client';
import {
  flushEvents,
  identify,
  alias,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
export const registerLogin = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('login')
    .description('Login to Optic')
    .action(errorHandler(getLoginAction(config)));
};

const getLoginAction = (config: OpticCliConfig) => async () => {
  const userConfig = await readUserConfig();
  if (userConfig?.token) {
    const { overwrite } = await prompts(
      {
        type: 'confirm',
        name: 'overwrite',
        message:
          'It appears you are already logged in, would you like to continue? Continuing will overwrite the old login credentials',
      },
      { onCancel: () => process.exit(1) }
    );
    if (!overwrite) {
      return;
    }
  }

  const tokenUrl = getNewTokenUrl(config.client.getWebBase());

  logger.info(`${chalk.blue('Generate a token below')}

Create an account and generate a personal access token at ${chalk.underline.blue(
    tokenUrl
  )}
  
`);

  // prompt breaks if we steal focus as its starting.
  setTimeout(() => open(tokenUrl), 100);

  const response = await prompts(
    {
      type: 'password',
      name: 'token',
      message: 'Enter your token here:',
    },
    { onCancel: () => process.exit(1) }
  );

  if (!response.token) {
    throw new Error('Expected token');
  }

  logger.info(chalk.green(`\nVerifying your token`));
  const newClient = createOpticClient(response.token);
  try {
    const result = await newClient.verifyToken();

    if (result.user) {
      alias(result.user.userId);
      identify(result.user.email);
      trackEvent('cli.login');
      await flushEvents();
    }
  } catch (e) {
    console.log(e);
    logger.error(chalk.red(`An error occurred while verifying your token.`));
    process.exitCode = 1;
    return;
  }

  const base64Token = Buffer.from(response.token).toString('base64');

  const newConfig = userConfig
    ? {
        ...userConfig,
        token: base64Token,
      }
    : {
        token: base64Token,
      };
  await fs.mkdir(path.dirname(USER_CONFIG_PATH), { recursive: true });
  await fs.writeFile(USER_CONFIG_PATH, JSON.stringify(newConfig), 'utf-8');

  logger.info(
    chalk.green(
      `Successfully saved your personal access token to ${USER_CONFIG_PATH}`
    )
  );
};
