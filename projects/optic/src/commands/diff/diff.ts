import { Command } from 'commander';
import open from 'open';

import {
  logComparison,
  generateChangelogData,
  terminalChangelog,
  UserError,
  jsonChangelog,
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
import { getAnonId } from '../../utils/anonymous-id';
import { compute } from './compute';
import { compressData } from './compressResults';

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
      '--ruleset <ruleset>',
      'run comparison with a locally defined ruleset, if not set, looks for the ruleset on the [x-optic-ruleset] key on the spec, and then the optic.dev.yml file.'
    )
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
): Promise<{ checks: { passed: number; failed: number; total: number } }> => {
  const { specResults, checks } = await compute(
    [baseFile, headFile],
    config,
    options
  );
  const diffResults = { checks };

  const changelogData = generateChangelogData({
    changes: specResults.changes,
    toFile: headFile.jsonLike,
    rules: specResults.results,
  });

  if (options.json) {
    console.log(JSON.stringify(jsonChangelog(changelogData)));
    return diffResults;
  } else {
    if (specResults.changes.length === 0) {
      console.log('No changes were detected');
    } else {
      console.log('');
    }
    for (const log of terminalChangelog(changelogData)) {
      console.log(log);
    }
  }

  if (options.check) {
    if (specResults.results.length > 0) {
      console.log('Checks');
      console.log('');
    }

    logComparison(specResults, { output: 'pretty', verbose: false });

    console.log('');
    console.log(
      `Configure check rulesets in optic cloud or your local optic.dev.yml file.`
    );
  }

  if (options.web) {
    if (
      specResults.changes.length === 0 &&
      (!options.check || specResults.results.length === 0)
    ) {
      console.log('Empty changelog: not opening web view');
      return diffResults;
    }
    const meta = {
      createdAt: new Date(),
      command: ['optic', ...process.argv.slice(2)].join(' '),
      file1,
      file2,
      base: options.base,
    };

    const compressedData = compressData(baseFile, headFile, specResults, meta);
    console.log('Opening up diff in web view');
    const anonymousId = await getAnonId();
    trackEvent('optic.diff.view_web', anonymousId, {
      compressedDataLength: compressedData.length,
      isInCi: process.env.CI === 'true',
    });
    await flushEvents();
    await open(`${config.client.getWebBase()}/cli/diff#${compressedData}`, {
      wait: false,
    });
  }

  return diffResults;
};

type DiffActionOptions = {
  base: string;
  check: boolean;
  web: boolean;
  json: boolean;
  ruleset?: string;
};

const getDiffAction =
  (config: OpticCliConfig) =>
  async (
    file1: string | undefined,
    file2: string | undefined,
    options: DiffActionOptions
  ) => {
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
    if (config.isAuthenticated) {
      const [baseParseResult, headParseResult] = parsedFiles;
      const apiId: string | null = 'TODO'; // headParseResult.jsonLike[OPTIC_URL_KEY] ?? baseParseResult.jsonLike[OPTIC_URL_KEY] ?? null
      const shouldUploadBaseSpec = baseParseResult.context && apiId;
      const shouldUploadHeadSpec = headParseResult.context && apiId;
      if (shouldUploadBaseSpec) {
        // TODO upload spec
      }
      if (shouldUploadHeadSpec) {
        // TODO upload spec
      }

      const shouldUploadResults =
        (shouldUploadBaseSpec || baseParseResult.isEmptySpec) &&
        (shouldUploadHeadSpec || headParseResult.isEmptySpec);

      if (shouldUploadResults) {
        // TODO upload results
      }
    }

    if (!options.web && !options.json) {
      console.log(
        chalk.blue(
          `Rerun this command with the --web flag to view the detailed changes in your browser`
        )
      );
    }

    if (diffResult.checks.failed > 0 && options.check) process.exitCode = 1;
  };
