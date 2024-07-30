import { Command, Option } from 'commander';
import { OpticCliConfig } from '../../config';
import path from 'path';
import { errorHandler } from '../../error-handler';

const usage = () => `
  optic ci setup
`;

type Provider = 'github' | 'gitlab';

type CISetupOptions = {
  provider: Provider;
  stdout: boolean;
};

const choices: Provider[] = ['github', 'gitlab'];

export const registerCiSetup = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('setup', { hidden: true })
    .configureHelp({
      commandUsage: usage,
    })
    .description('Generate a CI configuration for Optic')
    .addOption(
      new Option('-p, --provider <provider>', 'provider').choices(choices)
    )
    .option(
      '--stdout',
      'Print the CI config to stdout instead of writing to CI config file.',
      false
    )
    .action(errorHandler(getCiSetupAction(config), { command: 'ci-setup' }));
};

const getCiSetupAction =
  (config: OpticCliConfig) => async (options: CISetupOptions) => {
    console.error('Ci setup is not supported');
    return;
  };
