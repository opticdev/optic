import { Command } from 'commander';
import { OpticCliConfig, VCS } from '../../config';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { findOpenApiSpecsCandidates } from '../../utils/git-utils';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import { compute } from './compute';

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

// Match up the to and from candidates
// This will return the comparisons we can try to run
function matchCandidates(
  from: {
    ref: string;
    paths: string[];
  },
  to: { ref?: string; paths: string[] }
): Map<
  string,
  {
    from?: string;
    to?: string;
  }
> {
  const results = new Map<string, { from?: string; to?: string }>();
  for (const path of from.paths) {
    const strippedPath = path.replace(`${from.ref}:`, '');
    results.set(strippedPath, {
      from: path,
    });
  }

  for (const path of to.paths) {
    const strippedPath = to.ref ? path.replace(`${to.ref}:`, '') : path;
    const maybePathObject = results.get(strippedPath);
    if (maybePathObject) {
      maybePathObject.to = path;
    } else {
      results.set(strippedPath, {
        to: path,
      });
    }
  }
  return results;
}

async function computeAll(
  candidatesMap: ReturnType<typeof matchCandidates>,
  config: OpticCliConfig,
  options: DiffAllActionOptions
): Promise<{
  warnings: Warnings;
  results: Results;
}> {
  const warnings: Warnings = {
    missingOpticUrl: [],
    unparseableFromSpec: [],
    unparseableToSpec: [],
  };

  const results: Results = [];

  for await (const [_, candidate] of candidatesMap) {
    // try load both from + to spec
    let fromParseResults: ParseResult;
    let toParseResults: ParseResult;
    try {
      fromParseResults = await getFileFromFsOrGit(
        candidate.from,
        config,
        false
      );
    } catch (e) {
      warnings.unparseableFromSpec.push({
        path: candidate.from!,
        error: e,
      });
      continue;
    }

    try {
      toParseResults = await getFileFromFsOrGit(candidate.to, config, true);
    } catch (e) {
      warnings.unparseableToSpec.push({
        path: candidate.to!,
        error: e,
      });
      continue;
    }

    // Cases we run the comparison:
    // - if to spec has x-optic-url
    // - if from spec has x-optic-url AND to spec is empty
    if (
      typeof toParseResults.jsonLike[OPTIC_URL_KEY] === 'string' ||
      (typeof fromParseResults.jsonLike[OPTIC_URL_KEY] === 'string' &&
        toParseResults.isEmptySpec)
    ) {
      const { specResults, checks } = await compute(
        [fromParseResults, toParseResults],
        config,
        options
      );
      const diffResults = { checks };

      // TODO if authenticated upload

      // run comparisons
      // - upload specs
      // - run diff
      // - upload run
    } else if (
      !toParseResults.isEmptySpec &&
      typeof toParseResults.jsonLike[OPTIC_URL_KEY] !== 'string'
    ) {
      warnings.missingOpticUrl.push({
        path: candidate.to!,
      });
      continue;
    }
  }
  return {
    warnings,
    results,
  };
}

type Results = [];

type Warnings = {
  missingOpticUrl: {
    path: string;
  }[];
  unparseableFromSpec: {
    path: string;
    error: unknown;
  }[];
  unparseableToSpec: { path: string; error: unknown }[];
};

const getDiffAllAction =
  (config: OpticCliConfig) => async (options: DiffAllActionOptions) => {
    if (config.vcs?.type !== VCS.Git) {
      logger.error(
        `Error: optic diff-all must be called from a git repository.`
      );
      process.exitCode = 1;
      return;
    }

    let compareToCandidates;
    let compareFromCandidates;

    try {
      compareToCandidates = await findOpenApiSpecsCandidates(options.compareTo);
    } catch (e) {
      logger.error(
        `Error reading files from git history for --compare-to ${options.compareTo}`
      );
      logger.error(e);
      process.exitCode = 1;
      return;
    }

    try {
      compareFromCandidates = await findOpenApiSpecsCandidates(
        options.compareFrom
      );
    } catch (e) {
      logger.error(
        `Error reading files from git history for --compare-from ${options.compareFrom}`
      );
      logger.error(e);
      process.exitCode = 1;
      return;
    }

    const candidatesMap = matchCandidates(
      {
        ref: options.compareFrom,
        paths: compareFromCandidates,
      },
      {
        ref: options.compareTo,
        paths: compareToCandidates,
      }
    );

    const { warnings, results } = await computeAll(
      candidatesMap,
      config,
      options
    );

    // TODO if authenticated upload

    // TODO if the working dir is clean, or no x-optic-url specs detected, add a helpful message of what they might want to do
    // with results, log out results and print a summary
    // if --web, open browser
  };
