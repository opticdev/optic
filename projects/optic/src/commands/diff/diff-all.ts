import { Command } from 'commander';
import { OpticCliConfig, VCS } from '../../config';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';

const usage = () => `
  optic diff-all
  optic diff-all --compare-from main --compare-to feat/new-api --check --web --ruleset @org/example-ruleset`;

const helpText = `
Example usage:
  Diff all specs with \`x-optic-url\` in the current repo against HEAD~1
  $ optic diff-all

  Diff all specs with \`x-optic-url\` in the current repo from main to feature/1
  $ optic diff-all --compare-from main --compare-to feature/1

  Diff all specs with a ruleset, run checks and open up in a web browser
  $ optic diff-all --ruleset @org/example-ruleset --web --check
  `;

export const registerDiffAll = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('diff-all')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description('Run a diff on all specs with `x-optic-url`')
    .option(
      '--compare-to <compare-to>',
      'the head ref to compare against. Defaults to the current working directory'
    )
    .option(
      '--compare-from <compare-from>',
      'the base ref to compare against. Defaults to HEAD~1',
      'HEAD~1'
    )
    .option(
      '--ruleset <ruleset>',
      'run comparison with a locally defined ruleset, if not set, looks for the ruleset on the [x-optic-ruleset] key on the spec, and then the optic.dev.yml file.'
    )
    .option('--check', 'enable checks', false)
    .option('--web', 'view the diff in the optic changelog web view', false)
    .option('--json', 'output as json', false)
    .action(wrapActionHandlerWithSentry(getDiffAllAction(config)));
};

type DiffAllActionOptions = {
  compareTo?: string;
  compareFrom: string;
  ruleset?: string;
  check: boolean;
  web: boolean;
  json: boolean;
};

const getDiffAllAction =
  (config: OpticCliConfig) => async (options: DiffAllActionOptions) => {
    // TODO validate is in git repo
    // collect specs from the `to` branch AND the `from` branch - use the git get file candiate functions and modify to search based on `sha` or no sha
    // In the to-specs, list out valid openpai specs that do not have `x-optic-url` and warn
    // Filter out specs on `to` that do not have x-optic-url
    // filter out specs from `from` that do not have x-optic-url and that are already included in `to` (even to specs without `x-optic-url`)
    // TODO if the working dir is clean, or no x-optic-url specs detected, add a helpful message of what they might want to do
    // generate a list of comparisons
    // run comparisons
    // - upload specs
    // - run diff
    // - upload run
    // with results, log out results and print a summary
    // if --web, open browser
    // TODO implement --json flag
  };
