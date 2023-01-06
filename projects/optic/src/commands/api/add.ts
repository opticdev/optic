import { Command } from 'commander';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

import { OpticCliConfig, VCS } from '../../config';

const usage = () => `
  optic api add
  optic api add <path_to_spec.yml>
  optic api add <path_to_spec.yml> --history-depth 0
  optic api add <path_to_spec.yml> --ruleset <ruleset_id> --web`;

const helpText = `
Example usage:
  Add a single api to optic
  $ optic api add <path_to_spec.yml>

  Add a single api to optic and crawl through the history \`depth\` steps. history-depth=0 will crawl the entire history
  $ optic api add <path_to_spec.yml> --history-depth <depth>

  Discover all apis in the current repo
  $ optic api add

  Add all apis and attach rulesets - configure your ruleset in Optic cloud
  $ optic api add --ruleset <ruleset_id>
  `;

export const registerApiAdd = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('add')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Add APIs to Optic')
    .argument('[spec_path]', 'path to file to compare')
    .option(
      '--history-depth <history-depth>',
      'Set rulesets to run on API diffs. You can always add this later by setting the `[x-optic-ruleset]` key on your OpenAPI spec',
      '1'
    )
    .option(
      '--ruleset <ruleset>',
      'Set rulesets to run on API diffs. You can always add this later by setting the `[x-optic-ruleset]` key on your OpenAPI spec'
    )
    .option('--web', 'open to the added API in Optic Cloud', false)
    .action(wrapActionHandlerWithSentry(getApiAddAction(config)));
};

type ApiAddActionOptions = {
  historyDepth: string;
  ruleset?: boolean;
  web?: boolean;
};

const getApiAddAction =
  (config: OpticCliConfig) =>
  async (path_to_spec: string | undefined, options: ApiAddActionOptions) => {
    if (!path_to_spec && options.historyDepth !== '1') {
      console.error(
        'Invalid argument combination: Cannot set a history-depth !== 1 when no spec path is provided'
      );
      process.exitCode = 1;
      return;
    } else if ('TODO check if logged in, merge other open PR') {
      console.error('Must be logged in to add APIs. Log in with `optic login`');
      process.exitCode = 1;
      return;
    } else if ('TODO check in git repo') {
      console.error('Must have git in path and be in a git repo to add apis');
      process.exitCode = 1;
      return;
    }

    // TODO add prompts
    // Validation to do
    //  - if more than one org, ask for which org to add to
    // - if no ruleset
    //  - prompt for a ruleset / give suggestions

    if (path_to_spec) {
    } else {
    }

    // Then upload specs to optic cloud (with throttle, etc)
  };

type ApisToAdd = {
  path: string;
  revisions: {}[];
};

// TODO implement this as a stream
async function discoverOneApi(
  path: string,
  depth: string
): Promise<ApisToAdd[]> {
  // Check whether path is a valid openapi spec
  // If it is not, error and exit

  // first parent treats merge commits as a single depth (not including children in it)
  // git rev-list HEAD -n depth --first-parent or just git rev-list HEAD --first-parent

  // TODO should we stop when we see a spec removed?

  // go reverse and once we dont have that spec anymore, we finish

  return [];
}

async function discoverAllApis(): Promise<ApisToAdd[]> {
  // Pull all specs that match the openapi spec criteria
  return [];
}

async function uploadSpecs() {
  // upload specs
  // update the apis on the HEAD branch and add 'x-optic-url' to the apis
}
