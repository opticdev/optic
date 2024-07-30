import { Command } from 'commander';
import { OpticCliConfig, VCS } from '../../config';
import { errorHandler } from '../../error-handler';

const usage = () => `
  optic spec push <path_to_spec.yml>
  optic spec push <path_to_spec.yml> --tag [tags] --web`;

const helpText = `
Example usage:
  Push a spec version to optic
  $ optic spec push <path_to_spec.yml>

  Push a spec version to optic and include the tags "production" and "cbb82ba"
  $ optic spec push <path_to_spec.yml> --tag production,cbb82ba
`;

export const registerSpecPush = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('push')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Push a spec version')
    .argument('[spec_path]', 'path to file to push')
    .option(
      '--tag <tag>',
      'Adds additional tags to the spec version. In git repositories with a clean working directory, a git tag will automatically be included. Tags must be alphanumeric or the - _ : characters'
    )
    .option('--web', 'open to the push spec in Optic Cloud', false)
    .action(errorHandler(getSpecPushAction(config), { command: 'spec-push' }));
};

type SpecPushActionOptions = {
  tag?: string;
  web: false;
};

const getSpecPushAction =
  (config: OpticCliConfig) =>
  async (spec_path: string | undefined, options: SpecPushActionOptions) => {
    console.error('Spec push is not supported');
    return;
  };
