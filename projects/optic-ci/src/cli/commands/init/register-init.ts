import { Command } from 'commander';
import { wrapActionHandlerWithSentry } from '../../sentry';
import { init } from './init';

const initWithSentry = wrapActionHandlerWithSentry(init);

export const registerInit = (cli: Command) => {
  cli.command('init').action(initWithSentry);
};
