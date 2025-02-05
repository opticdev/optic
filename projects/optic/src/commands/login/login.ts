import { Command } from 'commander';
import { OpticCliConfig } from '../../config';
import { errorHandler } from '../../error-handler';
export const registerLogin = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('login', { hidden: true })
    .description('Login to Optic')
    .action(errorHandler(getLoginAction(config), { command: 'login' }));
};

const getLoginAction = (config: OpticCliConfig) => async () => {
  console.error('login is not supported');
  return;
};
