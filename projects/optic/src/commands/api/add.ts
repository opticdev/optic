import { Command } from 'commander';
import { OpticCliConfig } from '../../config';

import { errorHandler } from '../../error-handler';

function short(sha: string) {
  return sha.slice(0, 8);
}

const usage = () => `
  optic api add .
  optic api add ./folder
  optic api add <path_to_spec.yml> --history-depth 0
  optic api add <path_to_spec.yml> --web`;

const helpText = `
Example usage:
  Add a single api to optic
  $ optic api add <path_to_spec.yml>

  Add a single api to optic and crawl through the history \`depth\` steps. history-depth=0 will crawl the entire history
  $ optic api add <path_to_spec.yml> --history-depth <depth>

  Discover all apis in the current repo
  $ optic api add .

  `;

export const registerApiAdd = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('add')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Add APIs to Optic')
    .argument('[path_to_spec]', 'path to file or directory to add')
    .option(
      '--history-depth <history-depth>',
      'Sets the depth of how far to crawl through to add historic API data. Set history-depth=0 if you want to crawl the entire history',
      '1'
    )
    .option(
      '--start-commit <start-commit>',
      'Start backfilling at a certain commit. Should be used with history-depth'
    )
    .option('--all', 'add all', false)
    .option('--web', 'open to the added API in Optic Cloud', false)
    .action(errorHandler(getApiAddAction(config), { command: 'api-add' }));
};

type ApiAddActionOptions = {
  historyDepth: string;
  web: boolean;
  all: boolean;
  startCommit?: string;
};

export const getApiAddAction =
  (config: OpticCliConfig) =>
  async (path_to_spec: string | undefined, options: ApiAddActionOptions) => {
    console.error('Api add is not supported');
    return;
  };
