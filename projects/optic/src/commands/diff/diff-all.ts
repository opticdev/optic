import { Command } from 'commander';
import { OpticCliConfig, VCS } from '../../config';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { findOpenApiSpecsCandidates } from '../../utils/git-utils';
import { getFileFromFsOrGit, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import { compute } from './compute';
import chalk from 'chalk';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { getAnonId } from '../../utils/anonymous-id';
import open from 'open';
import { compressDataV2 } from './compressResults';
import {
  generateComparisonLogsV2,
  jsonChangelog,
  terminalChangelog,
} from '@useoptic/openapi-utilities';
import { uploadDiff } from './upload-diff';
import { getApiFromOpticUrl, getRunUrl } from '../../utils/cloud-urls';
import { writeDataForCi } from '../../utils/ci-data';

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
    .command('diff-all', { hidden: true })
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
  results: Result[];
}> {
  const warnings: Warnings = {
    missingOpticUrl: [],
    unparseableFromSpec: [],
    unparseableToSpec: [],
  };

  const results: Result[] = [];

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
      getApiFromOpticUrl(toParseResults.jsonLike[OPTIC_URL_KEY]) ||
      (getApiFromOpticUrl(fromParseResults.jsonLike[OPTIC_URL_KEY]) &&
        toParseResults.isEmptySpec)
    ) {
      logger.info(
        chalk.blue(
          `Diffing ${candidate.from ?? 'empty spec'} to ${
            candidate.to ?? 'empty spec'
          }`
        )
      );
      const { specResults, checks, changelogData, warnings } = await compute(
        [fromParseResults, toParseResults],
        config,
        options
      );

      for (const warning of warnings) {
        logger.warn(warning);
      }

      if (specResults.diffs.length === 0) {
        logger.info('No changes were detected');
      }
      logger.info('');

      for (const log of terminalChangelog(
        { from: fromParseResults.jsonLike, to: toParseResults.jsonLike },
        changelogData
      )) {
        logger.info(log);
      }

      if (options.check) {
        if (specResults.results.length > 0) {
          logger.info('Checks');
          logger.info('');
        }

        for (const log of generateComparisonLogsV2(
          changelogData,
          { from: fromParseResults.sourcemap, to: toParseResults.sourcemap },
          specResults,
          {
            output: 'pretty',
            verbose: false,
          }
        )) {
          logger.info(log);
        }

        logger.info('');
      }

      let url: string | null = null;
      if (config.isAuthenticated) {
        const run = await uploadDiff(
          {
            from: fromParseResults,
            to: toParseResults,
          },
          specResults,
          config
        );
        if (run) {
          url = getRunUrl(
            config.client.getWebBase(),
            run.orgId,
            run.apiId,
            run.runId
          );
          logger.info(`Uploaded results of diff to ${url}`);
        }
      }

      results.push({
        warnings,
        fromParseResults,
        toParseResults,
        specResults,
        checks,
        changelogData,
        from: candidate.from,
        to: candidate.to,
        url,
      });
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

type Result = Awaited<ReturnType<typeof compute>> & {
  fromParseResults: ParseResult;
  toParseResults: ParseResult;
  from?: string;
  to?: string;
  url: string | null;
};

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

function handleWarnings(warnings: Warnings, options: DiffAllActionOptions) {
  if (warnings.missingOpticUrl.length > 0) {
    logger.info(
      chalk.yellow(
        'Warning - the following OpenAPI specs were detected but did not have valid x-optic-url keys. `optic diff-all` only runs on specs that include `x-optic-url` keys that point to specs uploaded to optic.'
      )
    );
    logger.info('Run the `optic api add` command to add these specs to optic');
    logger.info(warnings.missingOpticUrl.map((f) => f.path).join('\n'));
    logger.info('');
  }

  if (warnings.unparseableFromSpec.length > 0) {
    logger.error(
      chalk.red(
        `Error - the following specs could not be parsed from the ref ${options.compareFrom}`
      )
    );

    for (const unparseableFrom of warnings.unparseableFromSpec) {
      logger.error(`spec: ${unparseableFrom.path}`);
      logger.error(unparseableFrom.error);
      logger.error('');
    }
  }

  if (warnings.unparseableToSpec.length > 0) {
    logger.error(
      chalk.red(
        `Error - the following specs could not be parsed from the ${
          options.compareTo
            ? `ref ${options.compareTo}`
            : 'current working directory'
        }`
      )
    );

    for (const unparseableTo of warnings.unparseableToSpec) {
      logger.error(`spec: ${unparseableTo.path}`);
      logger.error(unparseableTo.error);
      logger.error('');
    }
    process.exitCode = 1;
  }
}

async function openWebpage(
  url: string | null,
  { fromParseResults, toParseResults, specResults }: Result,
  config: OpticCliConfig
) {
  const analyticsData: Record<string, any> = {
    isInCi: config.isInCi,
  };
  if (!url) {
    const meta = {
      createdAt: new Date(),
      command: ['optic', ...process.argv.slice(2)].join(' '),
    };

    const compressedData = compressDataV2(
      fromParseResults,
      toParseResults,
      specResults,
      meta
    );
    analyticsData.compressedDataLength = compressedData.length;
    url = `${config.client.getWebBase()}/cli/diff#${compressedData}`;
  }
  const anonymousId = await getAnonId();
  trackEvent('optic.diff_all.view_web', anonymousId, analyticsData);

  await open(url, { wait: false });
}

const getDiffAllAction =
  (config: OpticCliConfig) => async (options: DiffAllActionOptions) => {
    if (config.vcs?.type !== VCS.Git) {
      logger.error(
        `Error: optic diff-all must be called from a git repository.`
      );
      process.exitCode = 1;
      return;
    }

    if (options.json) {
      // For json output we only want to render json
      logger.setLevel('silent');
    }

    let compareToCandidates: string[];
    let compareFromCandidates: string[];

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

    for (const result of results) {
      const { specResults, url } = result;
      if (
        options.web &&
        (specResults.diffs.length > 0 ||
          (!options.check && specResults.results.length > 0))
      ) {
        openWebpage(url, result, config);
      }
    }

    handleWarnings(warnings, options);

    if (results.length === 0) {
      logger.info(
        'No comparisons were run between specs - `optic diff-all` will run comparisons on any spec that has an `x-optic-url` key'
      );
      logger.info(
        'Get started by running `optic api add` and making a change to an API spec'
      );
    }

    if (options.check && !config.isInCi) {
      logger.info(
        `Configure check rulesets in optic cloud or your local optic.dev.yml file.`
      );
    }

    if (config.isInCi) {
      const errors: { name: string; error: string }[] = [
        ...warnings.unparseableFromSpec.map((spec) => ({
          name: spec.path,
          error: (spec.error as Error).message,
        })),
        ...warnings.unparseableToSpec.map((spec) => ({
          name: spec.path,
          error: (spec.error as Error).message,
        })),
      ];
      const completedComparisons = results.map((result) => ({
        warnings: result.warnings,
        groupedDiffs: result.changelogData,
        results: result.specResults.results,
        name: result.to ?? result.from ?? 'Unknown comparison',
        url: result.url,
      }));
      await writeDataForCi([...completedComparisons, ...errors]);
    }

    if (options.json) {
      // Needs to be a console.log call to render over the logger.level
      console.log(
        JSON.stringify({
          results: results.reduce((acc, next) => {
            const strippedPath = next.from
              ? next.from.replace(`${options.compareFrom}:`, '')
              : next.to?.replace(`${options.compareTo}:`, '') ?? 'empty diff';
            acc[strippedPath] = jsonChangelog(
              {
                from: next.fromParseResults.jsonLike,
                to: next.toParseResults.jsonLike,
              },
              next.changelogData
            );
            return acc;
          }, {}),
          warnings,
        })
      );
    }

    if (!options.web && !config.isInCi) {
      logger.info(
        chalk.blue(
          `Rerun this command with the --web flag to view the detailed changes in your browser`
        )
      );
    }
    await flushEvents();

    if (results.some((result) => result.checks.failed > 0) && options.check)
      process.exitCode = 1;
  };
