import { Command } from 'commander';
import { errorHandler } from '../../error-handler';
import { OpticCliConfig } from '../../config';

const usage = () => `
  optic spec add-api-url <path_to_spec.yml> <optic-api-url>`;

const helpText = `
Example usage:
  Add an Optic API URL to a spec file.
  $ optic spec add-api-url <path_to_spec.yml> <optic-api-url>
`;

export const registerSpecAddApiUrl = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('add-api-url')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Add Optic API URL to a spec file')
    .argument('<spec_path>', 'path to spec file')
    .argument('<api_url>', 'api url to add to spec file')
    .action(errorHandler(getAddApiUrlAction(config)));
};

const getAddApiUrlAction =
  (config: OpticCliConfig) => async (spec_path: string, api_url: string) => {
    console.log(spec_path, api_url);
  };
