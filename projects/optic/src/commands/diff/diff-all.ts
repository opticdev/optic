import { Command, Option } from 'commander';
import micromatch from 'micromatch';
import fg from 'fast-glob';
import { OpticCliConfig, VCS } from '../../config';
import * as Git from '../../utils/git-utils';
import { loadSpec, loadRaw, ParseResult } from '../../utils/spec-loaders';
import { logger } from '../../logger';
import { OPTIC_URL_KEY } from '../../constants';
import { compute } from './compute';
import chalk from 'chalk';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import open from 'open';
import { compressDataV2 } from './compressResults';
import { textToSev } from '@useoptic/openapi-utilities';
import { uploadDiff } from './upload-diff';
import { getApiFromOpticUrl } from '../../utils/cloud-urls';
import { writeDataForCi } from '../../utils/ci-data';
import { errorHandler } from '../../error-handler';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';
import path from 'path';
import { getApiUrl } from '../../utils/cloud-urls';
import { getDetailsForGeneration } from '../../utils/generated';
import { terminalChangelog } from './changelog-renderers/terminal-changelog';
import { jsonChangelog } from './changelog-renderers/json-changelog';
import * as Types from '../../client/optic-backend-types';

const usage = () => `
  optic diff-all
  optic diff-all --compare-from main --compare-to feat/new-api --check --web --standard @org/example-standard`;

const helpText = `
Example usage:
  Diff all specs with \`x-optic-url\` in the current repo against HEAD~1
  $ optic diff-all

  Diff all specs with \`x-optic-url\` in the current repo from main to feature/1
  $ optic diff-all --compare-from main --compare-to feature/1

  Diff all specs with a standard, run checks and open up in a web browser
  $ optic diff-all --standard @org/example-standard --web --check
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
      'the base ref to compare against. Defaults to HEAD~1. Also supports optic cloud tags (cloud:tag_name)',
      'HEAD~1'
    )
    .option(
      '--head-tag <head-tag>',
      'Adds additional tags to the HEAD spec. Should be used in conjunction with `--upload`'
    )
    .option(
      '--match <match>',
      'a glob to match specs (e.g. "**/*.yml" or "**/specifications/*.json"). Also takes \
      comma separated values (e.g. "**/*.yml,**/*.json")'
    )
    .option(
      '--ignore <ignore>',
      'an ignore glob to ignore certain matches (e.g. "**/*.yml" or "**/specifications/*.json"). Also takes \
comma separated values (e.g. "**/*.yml,**/*.json")'
    )
    .option(
      '--standard <standard>',
      'run comparison with a locally defined standard, if not set, looks for the standard on the [x-optic-standard] key on the spec, and then the optic.dev.yml file.'
    )
    .addOption(
      new Option(
        '--validation <validation>',
        'specify the level of validation on HEAD specs'
      )
        .choices(['strict', 'loose'])
        .default('strict')
    )
    .addOption(
      new Option(
        '--severity <severity>',
        'specify the severity level to exit with exit code, options are error, warn and info'
      )
        .choices(['error', 'warn', 'info'])
        .default('error')
    )
    .option('--check', 'enable checks', false)
    .option('--upload', 'upload specs', false)
    .option('--web', 'view the diff in the optic changelog web view', false)
    .option('--json', 'output as json', false)
    .option('--generated', 'use with --upload with a generated spec', false)
    .option(
      '--fail-on-untracked-openapi',
      'fail with exit code 1 if there are detected untracked apis',
      false
    )
    .action(errorHandler(getDiffAllAction(config)));
};

type DiffAllActionOptions = {
  compareTo?: string;
  compareFrom: string;
  standard?: string;
  match?: string;
  ignore?: string;
  headTag?: string;
  check: boolean;
  generated: boolean;
  web: boolean;
  upload: boolean;
  json: boolean;
  validation: 'strict' | 'loose';
  failOnUntrackedOpenapi: boolean;
  severity: 'info' | 'warn' | 'error';
};

type CandidateMap = Map<
  string,
  {
    from?: string;
    to?: string;
  }
>;

function getCandidatesFromCloudTag(
  tag: string,
  to: { ref?: string; paths: string[] },
  root: string
): CandidateMap {
  const results: CandidateMap = new Map();
  for (const toPath of to.paths) {
    const hasRef = to.ref && toPath.startsWith(`${to.ref}:`);
    const strippedPath = hasRef ? toPath.replace(`${to.ref}:`, '') : toPath;
    const pathFromRoot = path.relative(root, strippedPath);
    const refAndPathFromRoot = hasRef ? `${to.ref}:${pathFromRoot}` : toPath;

    results.set(pathFromRoot, {
      from: tag,
      to: refAndPathFromRoot,
    });
  }

  return results;
}

// Match up the to and from candidates
// This will return the comparisons we can try to run
function matchCandidates(
  from: {
    ref: string;
    paths: string[];
  },
  to: { ref?: string; paths: string[] },
  root: string
): CandidateMap {
  const results: CandidateMap = new Map();
  for (const fromPath of from.paths) {
    const strippedPath = fromPath.replace(`${from.ref}:`, '');
    const pathFromRoot = path.relative(root, strippedPath);
    results.set(pathFromRoot, {
      from: `${from.ref}:${pathFromRoot}`,
    });
  }

  for (const toPath of to.paths) {
    const hasRef = to.ref && toPath.startsWith(`${to.ref}:`);
    const strippedPath = hasRef ? toPath.replace(`${to.ref}:`, '') : toPath;
    const pathFromRoot = path.relative(root, strippedPath);
    const refAndPathFromRoot = hasRef ? `${to.ref}:${pathFromRoot}` : toPath;

    const maybePathObject = results.get(pathFromRoot);

    if (maybePathObject) {
      maybePathObject.to = refAndPathFromRoot;
    } else {
      results.set(pathFromRoot, {
        to: refAndPathFromRoot,
      });
    }
  }
  return results;
}

async function computeAll(
  candidateMap: CandidateMap,
  config: OpticCliConfig,
  options: DiffAllActionOptions
): Promise<{
  warnings: Warnings;
  results: Result[];
}> {
  const allWarnings: Warnings = {
    missingOpticUrl: [],
    unparseableFromSpec: [],
    unparseableToSpec: [],
  };

  const results: Result[] = [];
  const comparisons: Map<
    string,
    {
      from?: string;
      to?: string;
      opticUrl?: string;
    }
  > = new Map();

  for await (const [_, candidate] of candidateMap) {
    // We load the raw spec and discard the comparison if there is no optic url or is in an invalid version
    // Cases we run the comparison:
    // - if to spec has x-optic-url
    // - if from spec has x-optic-url AND to spec is empty
    const specPathToLoad = candidate.to ?? candidate.from;
    if (!specPathToLoad) {
      logger.debug(
        `Skipping comparison from ${candidate.from} to ${candidate.to} both are undefined`
      );
      continue;
    }

    let rawSpec;
    try {
      rawSpec = await loadRaw(specPathToLoad, config);
    } catch (e) {
      if (e instanceof Error && e['probablySpec']) {
        logger.error(`Error parsing ${specPathToLoad}:`);
        logger.error(e.message);
        process.exitCode = 1;
      }

      logger.debug(
        `Skipping comparison from ${candidate.from} to ${candidate.to} because parsing failed`
      );
      logger.debug(e);
      continue;
    }

    const opticUrl = rawSpec[OPTIC_URL_KEY];

    try {
      checkOpenAPIVersion(rawSpec);
    } catch (e) {
      logger.debug(
        `Skipping comparison from ${candidate.from} to ${candidate.to} because of error: `
      );
      logger.debug(e);

      continue;
    }

    const p = candidate.to ?? candidate.from;
    // should never happen
    if (!p) continue;
    const relativePath = path.relative(config.root, path.resolve(p));

    comparisons.set(relativePath, {
      from: candidate.from,
      to: candidate.to,
      opticUrl,
    });
  }

  if (options.generated) {
    const generatedDetails = await getDetailsForGeneration(config);
    if (generatedDetails) {
      const { web_url, organization_id, default_branch, default_tag } =
        generatedDetails;

      const pathToUrl: Record<string, string | null> = {};
      for (const [p, comparison] of comparisons.entries()) {
        if (!comparison.opticUrl) {
          pathToUrl[p] = null;
        }
      }
      let apis: (Types.Api | null)[] = [];
      if (Object.keys(pathToUrl).length > 0) {
        ({ apis } = await config.client.getApis(
          Object.keys(pathToUrl),
          web_url
        ));
      }

      for (const api of apis) {
        if (api) {
          pathToUrl[api.path] = getApiUrl(
            config.client.getWebBase(),
            api.organization_id,
            api.api_id
          );
        }
      }

      for (let [path, url] of Object.entries(pathToUrl)) {
        if (!url) {
          const api = await config.client.createApi(organization_id, {
            name: path,
            path,
            web_url: web_url,
            default_branch,
            default_tag,
          });
          url = getApiUrl(config.client.getWebBase(), organization_id, api.id);
        }
        const comparison = comparisons.get(path);
        if (comparison) comparison.opticUrl = url;
      }
    }
  }

  for (let { from, to, opticUrl } of comparisons.values()) {
    const cloudTag: string | null =
      !!from && /^cloud:/.test(from) ? from.replace(/^cloud:/, '') : null;

    const specDetails = getApiFromOpticUrl(opticUrl);

    if (!specDetails && (options.upload || cloudTag)) {
      logger.debug(
        `Skipping comparison from ${from} to ${to} because there was no x-optic-url`
      );
      allWarnings.missingOpticUrl.push({
        path: to!,
      });
      continue;
    } else if (specDetails && cloudTag) {
      from = `cloud:${specDetails.apiId}@${cloudTag}`;
    }

    // try load both from + to spec
    let fromParseResults: ParseResult;
    let toParseResults: ParseResult;
    try {
      fromParseResults = await loadSpec(from, config, {
        strict: false,
        denormalize: true,
      });
    } catch (e) {
      allWarnings.unparseableFromSpec.push({
        path: from!,
        error: e,
      });
      continue;
    }

    try {
      toParseResults = await loadSpec(to, config, {
        strict: options.validation === 'strict',
        denormalize: true,
        includeUncommittedChanges: options.generated,
      });
    } catch (e) {
      allWarnings.unparseableToSpec.push({
        path: to!,
        error: e,
      });
      continue;
    }

    logger.info(
      chalk.blue(`Diffing ${from ?? 'empty spec'} to ${to ?? 'empty spec'}`)
    );
    const { specResults, checks, changelogData, warnings, standard } =
      await compute([fromParseResults, toParseResults], config, {
        ...options,
        path: to ?? from ?? null,
      });

    for (const warning of warnings) {
      logger.warn(warning);
    }

    logger.info('');

    for (const log of terminalChangelog(
      { from: fromParseResults, to: toParseResults },
      changelogData,
      specResults,
      {
        path: to ?? from ?? '',
        check: options.check,
        inCi: config.isInCi,
        output: 'pretty',
        verbose: false,
        severity: textToSev(options.severity),
      }
    )) {
      logger.info(log);
    }

    let changelogUrl: string | null = null;
    let specUrl: string | null = null;
    if (options.upload) {
      const uploadResults = await uploadDiff(
        {
          from: fromParseResults,
          to: toParseResults,
        },
        specResults,
        config,
        specDetails,
        {
          headTag: options.headTag,
          standard,
        }
      );
      specUrl = uploadResults?.headSpecUrl ?? null;
      changelogUrl = uploadResults?.changelogUrl ?? null;
    }

    results.push({
      warnings,
      fromParseResults,
      toParseResults,
      specResults,
      checks,
      changelogData,
      from,
      to,
      changelogUrl,
      specUrl,
      standard,
    });
  }
  return {
    warnings: allWarnings,
    results,
  };
}

type Result = Awaited<ReturnType<typeof compute>> & {
  fromParseResults: ParseResult;
  toParseResults: ParseResult;
  from?: string;
  to?: string;
  specUrl: string | null;
  changelogUrl: string | null;
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

function handleWarnings(
  warnings: Warnings,
  options: DiffAllActionOptions,
  isCloudDiff: boolean
) {
  if (warnings.missingOpticUrl.length > 0) {
    logger.info(
      chalk.yellow(
        `Warning - the following OpenAPI specs were detected but did not have valid x-optic-url keys. ${
          isCloudDiff
            ? `optic diff-all --compare-from cloud:{tag}' can only runs on specs that have been added to optic`
            : `'optic diff-all --upload' can only runs on specs that have been added to optic`
        }`
      )
    );
    logger.info('');
    logger.info('Run the `optic api add` command to add these specs to optic');
    logger.info(
      warnings.missingOpticUrl
        .map((f) => `${f.path} ${chalk.red('(untracked)')}`)
        .join('\n')
    );
    logger.info('');

    if (options.failOnUntrackedOpenapi) {
      process.exitCode = 1;
    }
  }

  if (warnings.unparseableFromSpec.length > 0) {
    logger.error(
      chalk.red(
        `Error - the following specs could not be parsed from the ref ${options.compareFrom}`
      )
    );

    for (const unparseableFrom of warnings.unparseableFromSpec) {
      logger.error(`spec: ${unparseableFrom.path}`);
      logger.error((unparseableFrom.error as Error).message);
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
      logger.error((unparseableTo.error as Error).message);
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
  trackEvent('optic.diff_all.view_web', analyticsData);

  await open(url, { wait: false });
}

function sanitizeRef(maybeGitRef: string): string {
  return maybeGitRef.includes(':') ? maybeGitRef.split(':')[1] : maybeGitRef;
}

async function matchSpecCandidates(
  matchesOption?: string,
  ignoresOption?: string
): Promise<string[]> {
  const matches = matchesOption?.split(',').filter((g) => g !== '') ?? [];
  const ignores = ignoresOption?.split(',').filter((g) => g !== '') ?? [];

  const candidates = await fg(matches, { ignore: ignores });
  return candidates.filter((c) => /\.(json|ya?ml)$/i.test(c));
}

function applyGlobFilter(
  filePaths: string[],
  globs: {
    matches?: string;
    ignores?: string;
  }
): string[] {
  const matches = globs.matches?.split(',').filter((g) => g !== '') ?? [];
  const ignores = globs.ignores?.split(',').filter((g) => g !== '') ?? [];

  const globMatchers = matches.map((g) => micromatch.matcher(g));
  const ignoreMatchers = ignores.map((i) => micromatch.matcher(i));
  const matchedFiles = new Set(
    filePaths
      .filter((name) =>
        globMatchers.length === 0
          ? true
          : globMatchers.some((globFilter) => globFilter(sanitizeRef(name)))
      )
      .filter((name) =>
        ignoreMatchers.every((ignoreFilter) => !ignoreFilter(sanitizeRef(name)))
      )
  );

  return [...matchedFiles];
}

const getDiffAllAction =
  (config: OpticCliConfig) => async (options: DiffAllActionOptions) => {
    if (config.vcs?.type !== VCS.Git) {
      logger.error(
        `Error: optic diff-all must be called from a git repository.`
      );
      process.exitCode = 1;
      return;
    } else if (options.upload && !config.isAuthenticated) {
      logger.error(
        chalk.bold.red(
          'Error: Must be logged in to upload results. Run optic login to authenticate.'
        )
      );
      process.exitCode = 1;
      return;
    }

    if (options.json) {
      // For json output we only want to render json
      logger.setLevel('silent');
    }

    let candidateMap: CandidateMap;
    let compareToCandidates: string[];
    try {
      if (!options.compareTo && options.match) {
        compareToCandidates = await matchSpecCandidates(
          options.match,
          options.ignore
        );
      } else {
        options.compareTo && (await Git.assertRefExists(options.compareTo));
        compareToCandidates = await Git.findOpenApiSpecsCandidates(
          options.compareTo
        );
      }
    } catch (e) {
      logger.error(
        `Error reading files from git history for --compare-to ${options.compareTo}`
      );
      logger.error(e);
      process.exitCode = 1;
      return;
    }

    if (/^cloud:/.test(options.compareFrom)) {
      candidateMap = getCandidatesFromCloudTag(
        options.compareFrom,
        {
          ref: options.compareTo,
          paths: applyGlobFilter(compareToCandidates, {
            matches: options.match,
            ignores: options.ignore,
          }),
        },
        config.root
      );
    } else {
      let compareFromCandidates: string[];

      try {
        await Git.assertRefExists(options.compareFrom);
        compareFromCandidates = await Git.findOpenApiSpecsCandidates(
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

      candidateMap = matchCandidates(
        {
          ref: options.compareFrom,
          paths: applyGlobFilter(compareFromCandidates, {
            matches: options.match,
            ignores: options.ignore,
          }),
        },
        {
          ref: options.compareTo,
          paths: applyGlobFilter(compareToCandidates, {
            matches: options.match,
            ignores: options.ignore,
          }),
        },
        config.root
      );
    }

    const { warnings, results } = await computeAll(
      candidateMap,
      config,
      options
    );

    for (const result of results) {
      const { specResults, changelogUrl } = result;
      if (
        options.web &&
        (specResults.diffs.length > 0 ||
          (!options.check && specResults.results.length > 0))
      ) {
        openWebpage(changelogUrl, result, config);
      }
    }
    const isCloudDiff = /^cloud:/.test(options.compareFrom);
    handleWarnings(warnings, options, isCloudDiff);

    if (config.isInCi) {
      const errors: { name: string; error: string }[] = [
        ...warnings.unparseableFromSpec.map((spec) => ({
          name: spec.path,
          error: `Could not parse spec ${spec.path} from the ref ${
            options.compareFrom
          }

${(spec.error as Error).message}`,
        })),
        ...warnings.unparseableToSpec.map((spec) => ({
          name: spec.path,
          error: `Could not parse spec ${spec.path}

${(spec.error as Error).message}`,
        })),
      ];
      const completedComparisons = results.map((result) => ({
        warnings: result.warnings,
        groupedDiffs: result.changelogData,
        results: result.specResults.results,
        name: result.to ?? result.from ?? 'Unknown comparison',
        specUrl: result.specUrl,
        changelogUrl: result.changelogUrl,
      }));
      await writeDataForCi([...completedComparisons, ...errors], {
        severity: textToSev(options.severity),
      });
    }

    const comparisonsWithResults = results.filter(
      (result) =>
        result.specResults.diffs.length > 0 ||
        (!options.check && result.specResults.results.length > 0)
    );

    const maybeOrigin =
      config.vcs?.type === VCS.Git ? await Git.guessRemoteOrigin() : null;

    for (const result of results) {
      const filePath = result.to ?? result.from;
      const relativePath = path.relative(config.root, path.resolve(filePath!));

      trackEvent('optic.diff.completed', {
        specPath: relativePath,
        diffs: result.specResults.diffs.length,
        checks: result.specResults.results.length,
        isInCi: config.isInCi,
        ...(maybeOrigin?.web_url
          ? {
              webUrlAndPath: `${maybeOrigin.web_url}.${relativePath}`,
              webUrl: maybeOrigin.web_url,
            }
          : {}),
      });
    }

    trackEvent('optic.diff-all.completed', {
      numberOfComparisonsWithResults: comparisonsWithResults.length,
      numberOfComparisons: results.length,
      isInCi: config.isInCi,
      webUrl: maybeOrigin?.web_url,
    });

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

    if (results.length === 0) {
      logger.error(
        chalk.red.bold(
          'No OpenAPI specs were detected - exiting with error code 1'
        )
      );
      process.exitCode = 1;
    } else if (!config.isInCi) {
      if (options.check) {
        logger.info(
          `Configure check standards in optic cloud or your local optic.dev.yml file.`
        );
      }
      if (!options.web) {
        logger.info(
          chalk.blue(
            `Rerun this command with the --web flag to view the detailed changes in your browser`
          )
        );
      }
    }
    await flushEvents();

    if (
      results.some((result) => {
        const failures = result.checks.failed;
        const failuresForSeverity =
          options.severity === 'error'
            ? failures.error
            : options.severity === 'warn'
            ? failures.warn + failures.error
            : failures.warn + failures.error + failures.info;

        return failuresForSeverity > 0;
      }) &&
      options.check
    )
      process.exitCode = 1;
  };
