import { Command } from 'commander';
import { OpticCliConfig } from '../../config';
import { errorHandler } from '../../error-handler';

export const registerRulesetInit = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('init')
    .description('Initializes a new ruleset project')
    .argument('[name]', 'the name of the new ruleset project')
    .action(errorHandler(getInitAction(), { command: 'ruleset-init' }));
};

const getInitAction = () => async (name?: string) => {
  console.log('Ruleset upload is no longer supported');

  return;
};
