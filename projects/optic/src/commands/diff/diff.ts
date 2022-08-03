import { Command } from 'commander';
import brotli from 'brotli';
import open from 'open';

import {
  generateSpecResults,
  logComparison,
  generateChangelogData,
  terminalChangelog,
  OpenAPIV3,
  IChange,
} from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { StandardRulesets } from '@useoptic/standard-rulesets';
import { RuleRunner, Ruleset } from '@useoptic/rulesets-base';
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

const description = `run a diff between two API specs`;

const usage = () => `
  optic diff
  optic diff --base <base>
  optic diff --id user-api --base <base>
  optic diff <file_path> --base <base>
  optic diff <file_path> <file_to_compare_against>
  optic diff <file_path> <file_to_compare_against> --check`;

const helpText = `
Example usage:
  Diff all API specs files defined in your \`optic.yml\` config file against HEAD
  $ optic diff

  Diff all API specs files defined in your \`optic.yml\` config file against master
  $ optic diff --base master

  Diff a single \`user-api\` spec defined in your \`optic.yml\` config file against HEAD
  $ optic diff --id user-api

  Diff the single \`user-api\` spec from your \`optic.yml\` config file against master
  $ optic diff --id user-api --base master

  Diff \`specs/openapi-spec.yml\` against master
  $ optic diff openapi-spec.yml --base master

  Diff \`openapi-spec-v0.yml\` against \`openapi-spec-v1.yml\`
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml

  Run a diff and view changes in the Optic web view
  $ optic diff --id user-api --base master --web

  Run a diff and check the changes against the rulesets configured in your \`optic.yml\` config file:
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
    .option(
      '--id <id>',
      'the id of the spec to run against in defined in the `optic.yml` file'
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
  const compressed = brotli.compress(
    Buffer.from(JSON.stringify(dataToCompress))
  );
  const urlSafeString = Buffer.from(compressed).toString('base64');
  return urlSafeString;
};

const openBrowserToPage = async (url: string) => {
  await open(url, { wait: false });
};

const generateRuleRunner = (
  config: OpticCliConfig,
  checksEnabled: boolean
): RuleRunner => {
  const rulesets: Ruleset[] = [];

  if (checksEnabled) {
    for (const ruleset of config.ruleset) {
      const RulesetClass =
        StandardRulesets[ruleset.name as keyof typeof StandardRulesets];
      if (RulesetClass) {
        const instanceOrErrorMsg = RulesetClass.fromOpticConfig(ruleset.config);
        if (Ruleset.isInstance(instanceOrErrorMsg)) {
          rulesets.push(instanceOrErrorMsg);
        } else {
          console.error(
            `There were errors in the configuration for the ${ruleset.name} ruleset:`
          );
          console.error(instanceOrErrorMsg);
          console.error();
        }
      } else {
        console.error(`Warning: Invalid ruleset ${ruleset.name}`);
      }
    }
  }
  return new RuleRunner(rulesets);
};

const getBaseAndHeadFromFiles = async (
  file1: string,
  file2: string
): Promise<[ParseResult, ParseResult]> =>
  Promise.all([getFileFromFsOrGit(file1), getFileFromFsOrGit(file2)]);

const getBaseAndHeadFromFileAndBase = async (
  file1: string,
  base: string,
  root: string
): Promise<[ParseResult, ParseResult]> => {
  const { baseFile, headFile } = await parseFilesFromRef(file1, base, root);
  return [baseFile, headFile];
};

const runDiff = async (
  [file1, file2]: [string | undefined, string | undefined],
  [baseFile, headFile]: [ParseResult, ParseResult],
  config: OpticCliConfig,
  options: DiffActionOptions
) => {
  const ruleRunner = generateRuleRunner(config, options.check);
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

  if (options.check) {
    if (specResults.results.length > 0) {
      console.log('Checks');
      console.log('');
    }

    logComparison(specResults, { output: 'pretty', verbose: false });
  }

  if (options.web) {
    if (
      specResults.changes.length === 0 &&
      (!options.check || specResults.results.length === 0)
    ) {
      console.log('Empty changelog: not opening web view');
      return;
    }
    const meta = {
      createdAt: new Date(),
      command: ['optic', ...process.argv.slice(2)].join(' '),
      file1,
      file2,
      base: options.base,
      id: options.id,
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
};

type DiffActionOptions = {
  base: string;
  id?: string;
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
    if (file1 && file2) {
      const parsedFiles = await getBaseAndHeadFromFiles(file1, file2);
      await runDiff(files, parsedFiles, config, options);
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
      await runDiff(files, parsedFiles, config, options);
    } else if (options.id) {
      const commandVariant = `optic diff --id <id> --base <ref>`;
      if (config.vcs !== VCS.Git) {
        console.error(
          `Error: ${commandVariant} must be called from a git repository.`
        );
        process.exitCode = 1;
        return;
      }
      if (!config.configPath) {
        console.error(
          `Error: no optic.yml config file was found. optic.yml must be included for ${commandVariant}`
        );
        process.exitCode = 1;
        return;
      }

      console.log('Running diff against files from optic.yml file');
      const configFiles = config.files;
      const maybeMatchingFile = configFiles.find(
        (file) => file.id === options.id
      );
      if (!maybeMatchingFile) {
        console.error(`id: ${options.id} was not found in the optic.yml file`);
        console.log(
          `valid list of file names: ${configFiles
            .map((file) => file.id)
            .join(', ')}`
        );
        process.exitCode = 1;
        return;
      }
      const parsedFiles = await getBaseAndHeadFromFileAndBase(
        maybeMatchingFile.path,
        options.base,
        config.root
      );
      await runDiff(files, parsedFiles, config, options);
    } else {
      if (!config.configPath) {
        console.error(
          'Error: no `optic.yml` config file was found. Run `optic init` to generate a config file.'
        );
        process.exitCode = 1;
        return;
      } else if (config.files.length === 0) {
        console.error(
          'No files were found in your `optic.yml` file. Ensure that your `optic.yml` contains at least one file'
        );
        process.exitCode = 1;
        return;
      }
      for await (const configFile of config.files) {
        console.log(`${configFile.id}:`);
        const parsedFiles = await getBaseAndHeadFromFileAndBase(
          configFile.path,
          options.base,
          config.root
        );
        await runDiff(files, parsedFiles, config, options);
        console.log('');
      }
    }
    if (!options.web) {
      console.log(
        chalk.blue(
          `Rerun this command with the --web flag to view the detailed changes in your browser`
        )
      );
    }
  };
