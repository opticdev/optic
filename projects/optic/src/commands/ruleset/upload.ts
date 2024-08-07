import { Command } from 'commander';

import { OpticCliConfig } from '../../config';
import { errorHandler } from '../../error-handler';

export const registerRulesetUpload = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('upload')
    .configureHelp({
      commandUsage: () =>
        `OPTIC_TOKEN=your_token_here optic ruleset upload <path_to_ruleset>`,
    })
    .description('Upload a custom ruleset to optic cloud')
    .addHelpText(
      'after',
      `
This command also requires a token to be provided via the environment variable OPTIC_TOKEN. Generate an optic token at https://app.useoptic.com.`
    )
    .argument(
      '<path_to_ruleset>',
      'the path to the javascript ruleset file to upload, typically "./build/main.js".'
    )
    .option(
      '--organization-id <organization-id>',
      'specify an organization to add this to'
    )
    .action(
      errorHandler(getUploadAction(config), { command: 'ruleset-upload' })
    );
};

type UploadActionOptions = {
  organizationId?: string;
};

const getUploadAction =
  (config: OpticCliConfig) =>
  async (filePath: string, options: UploadActionOptions) => {
    console.log('Ruleset upload is no longer supported');
    return;
  };
