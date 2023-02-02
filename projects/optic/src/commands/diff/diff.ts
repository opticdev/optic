import { Command, Option } from 'commander';
import open from 'open';

import {
  generateComparisonLogsV2,
  terminalChangelog,
  UserError,
  jsonChangelog,
  generateSpecResults,
} from '@useoptic/openapi-utilities';
import {
  parseFilesFromRef,
  ParseResult,
  getFileFromFsOrGit,
} from '../../utils/spec-loaders';
import { OpticCliConfig, VCS } from '../../config';
import chalk from 'chalk';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { compute } from './compute';
import { compressData, compressDataV2 } from './compressResults';
import { generateRuleRunner } from './generate-rule-runner';
import { OPTIC_STANDARD_KEY } from '../../constants';
import { uploadDiff } from './upload-diff';
import { writeDataForCi } from '../../utils/ci-data';
import { logger } from '../../logger';
import { errorHandler } from '../../error-handler';
import path from 'path';

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
      'the base ref to compare against. Defaults to HEAD',
      'HEAD'
    )
    .option(
      '--standard <standard>',
      'run comparison with a locally defined standard, if not set, looks for the standard on the [x-optic-standard] key on the spec, and then the optic.dev.yml file.'
    )
    .addOption(new Option('--ruleset <ruleset>', '').hideHelp())
    .option('--check', 'enable checks', false)
    .option('--upload', 'upload run to cloud', false)
    .option('--web', 'view the diff in the optic changelog web view', false)
    .option('--json', 'output as json', false)
    .action(errorHandler(getDiffAction(config)));
};

const getBaseAndHeadFromFiles = async (
  file1: string,
  file2: string,
  config: OpticCliConfig
): Promise<[ParseResult, ParseResult]> => {
  try {
    // TODO update function to try download from spec-id cloud
    return Promise.all([
      getFileFromFsOrGit(file1, config, { strict: false, denormalize: true }),
      getFileFromFsOrGit(file2, config, { strict: true, denormalize: true }),
    ]);
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};

const getBaseAndHeadFromFileAndBase = async (
  file1: string,
  base: string,
  root: string,
  config: OpticCliConfig
): Promise<[ParseResult, ParseResult]> => {
  try {
    const { baseFile, headFile } = await parseFilesFromRef(
      file1,
      base,
      root,
      config,
      { denormalize: true }
    );
    return [baseFile, headFile];
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};

const runDiff = async (
  [baseFile, headFile]: [ParseResult, ParseResult],
  config: OpticCliConfig,
  options: DiffActionOptions
): Promise<{
  checks: { passed: number; failed: number; total: number };
  specResults: Awaited<ReturnType<typeof compute>>['specResults'];
  changelogData: Awaited<ReturnType<typeof compute>>['changelogData'];
  warnings: string[];
}> => {
  const { specResults, checks, changelogData, warnings } = await compute(
    [baseFile, headFile],
    config,
    options
  );
  const diffResults = { checks, specResults, changelogData, warnings };

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
      { output: 'pretty', verbose: false }
    )) {
      logger.info(log);
    }

    logger.info('');

    if (!hasOpticUrl) {
      logger.info(
        chalk.blue.bold(
          `See the full history of this API by running "optic api add ${
            path.parse(baseFile.sourcemap.rootFilePath).base
          } --history-depth 0"`
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
  standard?: string;
  ruleset?: string;
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

    if (options.ruleset && !options.standard) {
      options.standard = options.ruleset;
    }
    let parsedFiles: [ParseResult, ParseResult];
    if (file1 && file2) {
      parsedFiles = await getBaseAndHeadFromFiles(file1, file2, config);
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
        config
      );
    } else {
      logger.error(
        'Command removed: optic diff (no args) has been removed, please use optic diff <file_path> --base <base> instead'
      );
      process.exitCode = 1;
      return;
    }

    const diffResult = await runDiff(parsedFiles, config, options);
    let maybeUrl: string | null = null;
    const [baseParseResult, headParseResult] = parsedFiles;
    if (options.upload) {
      await uploadDiff(
        {
          from: baseParseResult,
          to: headParseResult,
        },
        diffResult.specResults,
        config
      );
    }

    if (options.web) {
      if (
        diffResult.specResults.diffs.length === 0 &&
        (!options.check || diffResult.specResults.results.length === 0)
      ) {
        logger.info('Empty changelog: not opening web view');
      }
      const analyticsData: Record<string, any> = {
        isInCi: config.isInCi,
      };

      if (!maybeUrl) {
        const meta = {
          createdAt: new Date(),
          command: ['optic', ...process.argv.slice(2)].join(' '),
          file1,
          file2,
          base: options.base,
        };

        let compressedData: string;
        if (process.env.NEW_WEB_VIEW === 'true') {
          compressedData = compressDataV2(
            baseParseResult,
            headParseResult,
            diffResult.specResults,
            meta
          );
        } else {
          // TODO remove this old flow when new web view is ready
          const { runner } = await generateRuleRunner(
            {
              rulesetArg: options.standard,
              specRuleset: headParseResult.isEmptySpec
                ? baseParseResult.jsonLike[OPTIC_STANDARD_KEY]
                : headParseResult.jsonLike[OPTIC_STANDARD_KEY],
              config,
            },
            options.check
          );
          const specResultsLegacy = await generateSpecResults(
            runner,
            baseParseResult,
            headParseResult,
            null
          );
          compressedData = compressData(
            baseParseResult,
            headParseResult,
            specResultsLegacy,
            meta
          );
        }
        analyticsData.compressedDataLength = compressedData.length;
        logger.info('Opening up diff in web view');
        maybeUrl = `${config.client.getWebBase()}/cli/diff#${compressedData}`;
        await flushEvents();
      }
      trackEvent('optic.diff.view_web', analyticsData);
      await open(maybeUrl, {
        wait: false,
      });
    }

    if (config.isInCi) {
      await writeDataForCi([
        {
          warnings: diffResult.warnings,
          groupedDiffs: diffResult.changelogData,
          name: file1,
          results: diffResult.specResults.results,
          url: maybeUrl,
        },
      ]);
    }

    if (!options.web && !options.json && !config.isInCi) {
      logger.info(
        chalk.bold.blue(
          `Rerun this command with the --web flag to view the detailed changes in your browser`
        )
      );
    }

    if (diffResult.checks.failed > 0 && options.check) process.exitCode = 1;
  };
