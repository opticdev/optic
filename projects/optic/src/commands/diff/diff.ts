import { Command } from 'commander';
import zlib from 'node:zlib';
import open from 'open';

import {
  generateSpecResults,
  logComparison,
  generateChangelogData,
  terminalChangelog,
  OpenAPIV3,
  IChange,
  UserError,
} from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  parseFilesFromRef,
  ParseResult,
  getFileFromFsOrGit,
} from '../../utils/spec-loaders';
import { OpticCliConfig, VCS } from '../../config';
import chalk from 'chalk';
import { generateRuleRunner } from './generate-rule-runner';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { getAnonId } from '../../utils/anonymous-id';

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

  Run a diff and view changes in the Optic web view
  $ optic diff --id user-api --base master --web

  Run a diff and check the changes against the rulesets configured in your \`optic.dev.yml\` config file:
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check
  `;

type SpecResults = Awaited<ReturnType<typeof generateSpecResults>>;
const webBase =
  process.env.OPTIC_ENV === 'staging'
    ? 'https://app.o3c.info'
    : process.env.OPTIC_ENV === 'local'
    ? 'http://localhost:3000'
    : 'https://app.useoptic.com';

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
    .option('--check', 'enable checks', false)
    .option('--web', 'view the diff in the optic changelog web view', false)
    .action(wrapActionHandlerWithSentry(getDiffAction(config)));
};

// We can remove the components from spec since the changelog is flattened, and any valid refs will
// already be added into endpoints they're used in
const removeComponentsFromSpec = (
  spec: OpenAPIV3.Document
): OpenAPIV3.Document => {
  const { components, ...componentlessSpec } = spec;
  return componentlessSpec;
};

const removeSourcemapsFromResults = (specResults: SpecResults): SpecResults => {
  const { results, changes, ...rest } = specResults;

  return {
    ...rest,
    results: results.map((result) => {
      const { sourcemap, ...sourcemaplessResult } = result;
      return sourcemaplessResult;
    }),
    changes: changes.map((change) => {
      const { sourcemap, ...sourcemaplessLocation } = change.location;
      return {
        ...change,
        location: {
          ...sourcemaplessLocation,
        },
      };
    }) as IChange[],
  };
};

const compressData = (
  baseFile: ParseResult,
  headFile: ParseResult,
  specResults: SpecResults,
  meta: Record<string, unknown>
): string => {
  const dataToCompress = {
    base: removeComponentsFromSpec(baseFile.jsonLike),
    head: removeComponentsFromSpec(headFile.jsonLike),
    results: removeSourcemapsFromResults(specResults),
    meta,
    version: '1',
  };
  const compressed = zlib.brotliCompressSync(
    Buffer.from(JSON.stringify(dataToCompress))
  );
  const urlSafeString = Buffer.from(compressed).toString('base64');
  return urlSafeString;
};

const openBrowserToPage = async (url: string) => {
  await open(url, { wait: false });
};

const getBaseAndHeadFromFiles = async (
  file1: string,
  file2: string
): Promise<[ParseResult, ParseResult]> => {
  try {
    return Promise.all([getFileFromFsOrGit(file1), getFileFromFsOrGit(file2)]);
  } catch (e) {
    console.error(e);
    throw new UserError();
  }
};

const getBaseAndHeadFromFileAndBase = async (
  file1: string,
  base: string,
  root: string
): Promise<[ParseResult, ParseResult]> => {
  try {
    const { baseFile, headFile } = await parseFilesFromRef(file1, base, root);
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
  const ruleRunner = await generateRuleRunner(
    config,
    options.check
  );
  const specResults = await generateSpecResults(
    ruleRunner,
    baseFile,
    headFile,
    null
  );

  const changelogData = generateChangelogData({
    changes: specResults.changes,
    toFile: headFile.jsonLike,
    rules: specResults.results,
  });

  if (specResults.changes.length === 0) {
    console.log('No changes were detected');
  } else {
    console.log('');
  }
  for (const log of terminalChangelog(changelogData)) {
    console.log(log);
  }

  const diffResults = {
    checks: {
      total: specResults.results.length,
      passed: specResults.results.filter((check) => check.passed).length,
      failed: specResults.results.filter(
        (check) => !check.passed && !check.exempted
      ).length,
    },
  };

  if (options.check) {
    if (specResults.results.length > 0) {
      console.log('Checks');
      console.log('');
    }

    logComparison(specResults, { output: 'pretty', verbose: false });

    console.log('');
    console.log(`Configure check rulesets in your local optic.dev.yml file.`);
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
    });
    await flushEvents();
    await openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);
  }

  return diffResults;
};

type DiffActionOptions = {
  base: string;
  check: boolean;
  web: boolean;
};

const getDiffAction =
  (config: OpticCliConfig) =>
  async (
    file1: string | undefined,
    file2: string | undefined,
    options: DiffActionOptions
  ) => {
    const files: [string | undefined, string | undefined] = [file1, file2];
    let shouldExit1 = false;
    if (file1 && file2) {
      const parsedFiles = await getBaseAndHeadFromFiles(file1, file2);
      const diffResult = await runDiff(files, parsedFiles, config, options);
      shouldExit1 = diffResult.checks.failed > 0 && options.check;
    } else if (file1) {
      if (config.vcs !== VCS.Git) {
        const commandVariant = `optic diff <file> --base <ref>`;
        console.error(
          `Error: ${commandVariant} must be called from a git repository.`
        );
        process.exitCode = 1;
        return;
      }
      const parsedFiles = await getBaseAndHeadFromFileAndBase(
        file1,
        options.base,
        config.root
      );
      const diffResult = await runDiff(files, parsedFiles, config, options);
      shouldExit1 = diffResult.checks.failed > 0 && options.check;
    } else {
      console.error(
        'Command removed: optic diff (no args) has been removed, please use optic diff <file_path> --base <base> instead'
      );
      process.exitCode = 1;
      return;
    }
    if (!options.web) {
      console.log(
        chalk.blue(
          `Rerun this command with the --web flag to view the detailed changes in your browser`
        )
      );
    }

    if (shouldExit1) process.exitCode = 1;
  };
