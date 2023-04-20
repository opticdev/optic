import { Command } from 'commander';
import { errorHandler } from '../../error-handler';
import { OpticCliConfig } from '../../config';
import { OPTIC_URL_KEY } from '../../constants';
import { writeJson, writeYml } from '../../utils/write-to-file';
import chalk from 'chalk';
import { logger } from '../../logger';

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
    if (/.json/i.test(spec_path)) {
      await writeJson(spec_path, {
        [OPTIC_URL_KEY]: api_url,
      });
    } else {
      await writeYml(spec_path, {
        [OPTIC_URL_KEY]: api_url,
      });
    }

    logger.info(chalk.green(`Added ${OPTIC_URL_KEY} to ${spec_path}`));
  };
