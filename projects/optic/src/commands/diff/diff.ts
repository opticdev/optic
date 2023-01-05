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
import { generateRuleRunner } from './generate-rule-runner';
import {
  flushEvents,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';
import { getAnonId } from '../../utils/anonymous-id';
import { OPTIC_RULESET_KEY } from '../../constants';

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

  Run a diff and check the changes against the detected ruleset (looks at --ruleset, then 'x-optic-ruleset' in the spec, then the optic.dev.yml file)):
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check

  Specify a different ruleset config to run against
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml --check --ruleset ./other_config.yml
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
    .option(
      '--ruleset <ruleset>',
      'run comparison with a locally defined ruleset, if not set, looks for the ruleset on the [x-optic-ruleset] key on the spec, and then the optic.dev.yml file.'
    )
    .option('--check', 'enable checks', false)
    .option('--web', 'view the diff in the optic changelog web view', false)
    .option('--json', 'output as json', false)
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
  file2: string,
  config: OpticCliConfig
): Promise<[ParseResult, ParseResult]> => {
  try {
    // TODO update function to try download from spec-id cloud
    return Promise.all([
      getFileFromFsOrGit(file1, config),
      getFileFromFsOrGit(file2, config),
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
  const ruleRunner = await generateRuleRunner(
    {
      rulesetArg: options.ruleset,
      specRuleset: headFile.isEmptySpec
        ? baseFile.jsonLike[OPTIC_RULESET_KEY]
        : headFile.jsonLike[OPTIC_RULESET_KEY],
      config,
    },
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

  const diffResults = {
    checks: {
      total: specResults.results.length,
      passed: specResults.results.filter((check) => check.passed).length,
      failed: specResults.results.filter(
        (check) => !check.passed && !check.exempted
      ).length,
    },
  };

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
      const baseParseApiId: string | null = 'TODO';
      const headParseApiId: string | null = 'TODO';
      const shouldUploadBaseSpec = baseParseResult.context && baseParseApiId;
      const shouldUploadHeadSpec = headParseResult.context && headParseApiId;
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
