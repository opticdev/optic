import { Command, Option } from 'commander';
import open from 'open';

import {
  terminalChangelog,
  UserError,
  jsonChangelog,
  textToSev,
} from '@useoptic/openapi-utilities';
import { generateComparisonLogsV2 } from '../../utils/diff-renderer';

import {
  parseFilesFromRef,
  ParseResult,
  loadSpec,
  parseFilesFromCloud,
} from '../../utils/spec-loaders';
import { ConfigRuleset, OpticCliConfig, VCS } from '../../config';
import chalk from 'chalk';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { compute } from './compute';
import { compressDataV2 } from './compressResults';
import { uploadDiff } from './upload-diff';
import { writeDataForCi } from '../../utils/ci-data';
import { logger } from '../../logger';
import { errorHandler } from '../../error-handler';
import path from 'path';
import { OPTIC_URL_KEY } from '../../constants';
import { getApiFromOpticUrl } from '../../utils/cloud-urls';
import * as Git from '../../utils/git-utils';

const description = `run a diff between two API specs`;

const usage = () => `
  optic diff <file_path> --base <base>
  optic diff <file_path> <file_to_compare_against>
  optic diff <file_path> <file_to_compare_against> --check`;

const helpText = `
Example usage:
  Diff \`specs/openapi-spec.yml\` against master
  $ optic diff openapi-spec.yml --base master

  Diff \`openapi-spec-v0.yml\` against \`openapi-spec-v1.yml\`
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml

  Run a diff and check the changes against the detected standard (looks at --standard, then 'x-optic-standard' in the spec, then the optic.dev.yml file)):
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check

  Specify a different standard config to run against
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check --standard ./other_config.yml
  `;

export const registerDiff = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('diff')
    .configureHelp({
      commandUsage: usage,
    })
    .addHelpText('after', helpText)
    .description(description)
    .argument('[file_path]', 'path to file to compare')
    .argument('[file_to_compare_against]', 'path to file to compare with')
    .option(
      '--base <base>',
      'the base ref to compare against. Defaults to HEAD. Also supports optic cloud tags (cloud:tag_name)',
      'HEAD'
    )
    .option(
      '--standard <standard>',
      'run comparison with a locally defined standard, if not set, looks for the standard on the [x-optic-standard] key on the spec, and then the optic.dev.yml file.'
    )
    .option(
      '--head-tag <head-tag>',
      'Adds additional tags to the HEAD spec. Should be used in conjunction with `--upload`'
    )
    .addOption(new Option('--ruleset <ruleset>', '').hideHelp())
    .addOption(
      new Option(
        '--severity <severity>',
        'specify the severity level to exit with exit code, options are error, warn and info'
      )
        .choices(['error', 'warn', 'info'])
        .default('error')
    )
    .addOption(
      new Option(
        '--validation <validation>',
        'specify the level of validation to run'
      )
        .choices(['strict', 'loose'])
        .default('strict')
    )
    .option('--check', 'enable checks', false)
    .option('--upload', 'upload run to cloud', false)
    .option('--web', 'view the diff in the optic changelog web view', false)
    .option('--json', 'output as json', false)
    .option('--generated', 'use with --upload with a generated spec', false)
    .action(errorHandler(getDiffAction(config)));
};

type SpecDetails = { apiId: string; orgId: string } | null;

const getBaseAndHeadFromFiles = async (
  file1: string,
  file2: string,
  config: OpticCliConfig,
  options: DiffActionOptions
): Promise<[ParseResult, ParseResult, SpecDetails]> => {
  try {
    const [baseFile, headFile] = await Promise.all([
      loadSpec(file1, config, {
        strict: options.validation === 'strict',
        denormalize: true,
        includeUncommittedChanges: options.generated,
      }),
      loadSpec(file2, config, {
        strict: options.validation === 'strict',
        denormalize: true,
        includeUncommittedChanges: options.generated,
      }),
    ]);
    const opticUrl: string | null =
      headFile.jsonLike[OPTIC_URL_KEY] ??
      baseFile.jsonLike[OPTIC_URL_KEY] ??
      null;
    const specDetails = opticUrl ? getApiFromOpticUrl(opticUrl) : null;
    return [baseFile, headFile, specDetails];
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    throw new UserError();
  }
};

const getBaseAndHeadFromFileAndBase = async (
  file1: string,
  base: string,
  root: string,
  config: OpticCliConfig,
  options: DiffActionOptions
): Promise<[ParseResult, ParseResult, SpecDetails]> => {
  try {
    if (/^cloud:/.test(base)) {
      const { baseFile, headFile, specDetails } = await parseFilesFromCloud(
        file1,
        base.replace(/^cloud:/, ''),
        config,
        {
          denormalize: true,
          headStrict: options.validation === 'strict',
          generated: options.generated,
        }
      );
      return [baseFile, headFile, specDetails];
    } else {
      const { baseFile, headFile } = await parseFilesFromRef(
        file1,
        base,
        root,
        config,
        {
          denormalize: true,
          headStrict: options.validation === 'strict',
          includeUncommittedChanges: options.generated,
        }
      );
      const opticUrl: string | null =
        headFile.jsonLike[OPTIC_URL_KEY] ??
        baseFile.jsonLike[OPTIC_URL_KEY] ??
        null;
      const specDetails = opticUrl ? getApiFromOpticUrl(opticUrl) : null;
      return [baseFile, headFile, specDetails];
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    throw new UserError();
  }
};

const runDiff = async (
  [baseFile, headFile]: [ParseResult, ParseResult, SpecDetails],
  config: OpticCliConfig,
  options: DiffActionOptions,
  filepath: string
): Promise<{
  checks: Awaited<ReturnType<typeof compute>>['checks'];
  specResults: Awaited<ReturnType<typeof compute>>['specResults'];
  changelogData: Awaited<ReturnType<typeof compute>>['changelogData'];
  warnings: string[];
  standard: ConfigRuleset[];
}> => {
  const { specResults, checks, changelogData, warnings, standard } =
    await compute([baseFile, headFile], config, { ...options, path: filepath });
  const diffResults = {
    checks,
    specResults,
    changelogData,
    warnings,
    standard,
  };

  const hasOpticUrl = headFile.jsonLike['x-optic-url'];

  if (options.json) {
    console.log(
      JSON.stringify(
        jsonChangelog(
          { from: baseFile.jsonLike, to: headFile.jsonLike },
          changelogData
        )
      )
    );
    return diffResults;
  } else {
    for (const warning of warnings) {
      logger.warn(warning);
    }

    if (specResults.diffs.length === 0) {
      logger.info('No changes were detected');
    } else {
      logger.info('');
    }
    for (const log of terminalChangelog(
      { from: baseFile.jsonLike, to: headFile.jsonLike },
      changelogData
    )) {
      logger.info(log);
    }
  }

  if (options.check) {
    if (specResults.results.length > 0) {
      logger.info('Checks');
      logger.info('');
    }

    for (const log of generateComparisonLogsV2(
      changelogData,
      {
        from: baseFile.sourcemap,
        to: headFile.sourcemap,
      },
      specResults,
      {
        output: 'pretty',
        verbose: false,
        severity: textToSev(options.severity),
      }
    )) {
      logger.info(log);
    }

    logger.info('');
    if ((!hasOpticUrl && headFile.from === 'file') || headFile.from === 'git') {
      const relativePath = path.relative(
        process.cwd(),
        headFile.sourcemap.rootFilePath
      );
      logger.info(
        chalk.blue.bold(
          `See the full history of this API by running "optic api add ${relativePath} --history-depth 0"`
        )
      );
    }
  }

  return diffResults;
};

type DiffActionOptions = {
  base: string;
  check: boolean;
  web: boolean;
  upload: boolean;
  json: boolean;
  generated: boolean;
  standard?: string;
  ruleset?: string;
  headTag?: string;
  validation: 'strict' | 'loose';
  severity: 'info' | 'warn' | 'error';
};

const getDiffAction =
  (config: OpticCliConfig) =>
  async (
    file1: string | undefined,
    file2: string | undefined,
    options: DiffActionOptions
  ) => {
    if (options.upload && !config.isAuthenticated) {
      logger.error(
        chalk.bold.red(
          'Error: Must be logged in to upload results. Run optic login to authenticate.'
        )
      );
      return;
    }

    if (!options.web && !options.json && !config.isInCi) {
      logger.info(
        chalk.gray(
          `Rerun this command with the ${chalk.whiteBright(
            '--web'
          )} flag to open a visual changelog your browser`
        )
      );
    }

    if (options.ruleset && !options.standard) {
      options.standard = options.ruleset;
    }
    let parsedFiles: [ParseResult, ParseResult, SpecDetails];
    if (file1 && file2) {
      parsedFiles = await getBaseAndHeadFromFiles(
        file1,
        file2,
        config,
        options
      );
    } else if (file1) {
      if (config.vcs?.type !== VCS.Git) {
        const commandVariant = `optic diff <file> --base <ref>`;
        logger.error(
          `Error: ${commandVariant} must be called from a git repository.`
        );
        process.exitCode = 1;
        return;
      }
      parsedFiles = await getBaseAndHeadFromFileAndBase(
        file1,
        options.base,
        config.root,
        config,
        options
      );
    } else {
      logger.error(
        'Command removed: optic diff (no args) has been removed, please use optic diff <file_path> --base <base> instead'
      );
      process.exitCode = 1;
      return;
    }

    const diffResult = await runDiff(parsedFiles, config, options, file1);
    let maybeChangelogUrl: string | null = null;
    let specUrl: string | null = null;

    let [baseParseResult, headParseResult, specDetails] = parsedFiles;
    if (options.upload) {
      const uploadResults = await uploadDiff(
        {
          from: baseParseResult,
          to: headParseResult,
        },
        diffResult.specResults,
        config,
        specDetails,
        {
          headTag: options.headTag,
          standard: diffResult.standard,
        }
      );
      specUrl = uploadResults?.headSpecUrl ?? null;
      maybeChangelogUrl = uploadResults?.changelogUrl ?? null;
    }

    if (options.web) {
      if (
        diffResult.specResults.diffs.length === 0 &&
        (!options.check || diffResult.specResults.results.length === 0)
      ) {
        logger.info('Empty changelog: not opening web view');
      } else {
        const analyticsData: Record<string, any> = {
          isInCi: config.isInCi,
        };

        if (!maybeChangelogUrl) {
          const meta = {
            createdAt: new Date(),
            command: ['optic', ...process.argv.slice(2)].join(' '),
            file1,
            file2,
            base: options.base,
          };

          const compressedData = compressDataV2(
            baseParseResult,
            headParseResult,
            diffResult.specResults,
            meta
          );
          analyticsData.compressedDataLength = compressedData.length;
          logger.info('Opening up diff in web view');
          maybeChangelogUrl = `${config.client.getWebBase()}/cli/diff#${compressedData}`;
          await flushEvents();
        }
        trackEvent('optic.diff.view_web', analyticsData);
        await open(maybeChangelogUrl, {
          wait: false,
        });
      }
    }

    if (config.isInCi) {
      await writeDataForCi(
        [
          {
            warnings: diffResult.warnings,
            groupedDiffs: diffResult.changelogData,
            name: file1,
            results: diffResult.specResults.results,
            specUrl,
            changelogUrl: maybeChangelogUrl,
          },
        ],
        {
          severity: textToSev(options.severity),
        }
      );
    }

    const maybeOrigin =
      config.vcs?.type === VCS.Git ? await Git.guessRemoteOrigin() : null;

    const relativePath = path.relative(config.root, path.resolve(file1));
    trackEvent('optic.diff.completed', {
      specPath: relativePath,
      diffs: diffResult.specResults.diffs.length,
      checks: diffResult.specResults.results.length,
      isInCi: config.isInCi,
      ...(maybeOrigin?.web_url
        ? {
            webUrlAndPath: `${maybeOrigin.web_url}.${relativePath}`,
            webUrl: maybeOrigin.web_url,
          }
        : {}),
    });

    const failures = diffResult.checks.failed;
    const failuresForSeverity =
      options.severity === 'error'
        ? failures.error
        : options.severity === 'warn'
        ? failures.warn + failures.error
        : failures.warn + failures.error + failures.info;

    if (failuresForSeverity > 0 && options.check) process.exitCode = 1;
  };
