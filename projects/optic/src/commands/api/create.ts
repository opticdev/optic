import { Command } from 'commander';
import { errorHandler } from '../../error-handler';
import { OpticCliConfig, VCS } from '../../config';

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
  console.error('api create is not supported');
  return;
};
