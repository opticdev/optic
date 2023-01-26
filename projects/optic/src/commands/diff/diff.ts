import { Command, Option } from 'commander';
import open from 'open';

import {
  generateComparisonLogsV2,
  terminalChangelog,
  UserError,
  jsonChangelog,
  generateSpecResults,
} from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
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
import { getRunUrl } from '../../utils/cloud-urls';
import { writeDataForCi } from '../../utils/ci-data';

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
    .option('--web', 'view the diff in the optic changelog web view', false)
    .option('--json', 'output as json', false)
    .action(wrapActionHandlerWithSentry(getDiffAction(config)));
};

const getBaseAndHeadFromFiles = async (
  file1: string,
  file2: string,
  config: OpticCliConfig
): Promise<[ParseResult, ParseResult]> => {
  try {
    // TODO update function to try download from spec-id cloud
    return Promise.all([
      getFileFromFsOrGit(file1, config, false),
      getFileFromFsOrGit(file2, config, true),
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
      config
    );
    return [baseFile, headFile];
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};

const runDiff = async (
  [file1, file2]: [string | undefined, string | undefined],
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
      console.warn(warning);
    }

    if (specResults.diffs.length === 0) {
      console.log('No changes were detected');
    } else {
      console.log('');
    }
    for (const log of terminalChangelog(
      { from: baseFile.jsonLike, to: headFile.jsonLike },
      changelogData
    )) {
      console.log(log);
    }
  }

  if (options.check) {
    if (specResults.results.length > 0) {
      console.log('Checks');
      console.log('');
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
      console.log(log);
    }

    if (!config.isInCi) {
      console.log('');
      console.log(
        `Configure check standards in optic cloud or your local optic.dev.yml file.`
      );
    }
  }

  return diffResults;
};

type DiffActionOptions = {
  base: string;
  check: boolean;
  web: boolean;
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
    if (options.ruleset && !options.standard) {
      options.standard = options.ruleset;
    }
    const files: [string | undefined, string | undefined] = [file1, file2];
    let parsedFiles: [ParseResult, ParseResult];
    if (file1 && file2) {
      parsedFiles = await getBaseAndHeadFromFiles(file1, file2, config);
    } else if (file1) {
      if (config.vcs?.type !== VCS.Git) {
        const commandVariant = `optic diff <file> --base <ref>`;
        console.error(
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
      console.error(
        'Command removed: optic diff (no args) has been removed, please use optic diff <file_path> --base <base> instead'
      );
      process.exitCode = 1;
      return;
    }

    const diffResult = await runDiff(files, parsedFiles, config, options);
    let maybeUrl: string | null = null;
    const [baseParseResult, headParseResult] = parsedFiles;
    if (config.isAuthenticated) {
      const run = await uploadDiff(
        {
          from: baseParseResult,
          to: headParseResult,
        },
        diffResult.specResults,
        config
      );
      if (run) {
        maybeUrl = getRunUrl(
          config.client.getWebBase(),
          run.orgId,
          run.apiId,
          run.runId
        );
        console.log(`Uploaded results of diff to ${maybeUrl}`);
      }
    }

    if (options.web) {
      if (
        diffResult.specResults.diffs.length === 0 &&
        (!options.check || diffResult.specResults.results.length === 0)
      ) {
        console.log('Empty changelog: not opening web view');
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
        (analyticsData.compressedDataLength = compressedData.length),
          console.log('Opening up diff in web view');
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
      console.log(
        chalk.blue(
          `Rerun this command with the --web flag to view the detailed changes in your browser`
        )
      );
    }

    if (diffResult.checks.failed > 0 && options.check) process.exitCode = 1;
  };
