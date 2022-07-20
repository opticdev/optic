import fs from 'node:fs/promises';
import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { Command } from 'commander';
import brotli from 'brotli';
import open from 'open';

import {
  defaultEmptySpec,
  validateOpenApiV3Document,
  generateSpecResults,
} from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  ParseResult,
  parseSpecVersion,
  specFromInputToResults,
} from '@useoptic/optic-ci/build/cli/commands/utils';
import {
  hasGit,
  isInGitRepo,
  getRootPath,
} from '@useoptic/optic-ci/build/cli/commands/init/git-utils';
import { BreakingChangesRuleset } from '@useoptic/standard-rulesets';
import { RuleRunner } from '@useoptic/rulesets-base';
import { OpticCliConfig, VCS } from '../../config';

const exec = promisify(callbackExec);

const description = `run a diff between two API specs`;

const usage = () => `
  optic diff --id user-api --base <base>
  optic diff <file_path> --base <base>
  optic diff <file_path> <file_to_compare_against>`;

const helpText = `
Example usage:
  Run a diff against the api spec \`user-api\` using the config from your \`optic.yml\` file against master
  $ optic diff --id user-api --base master

  Run a diff between \`master:specs/openapi-spec.yml\` and \`specs/openapi-spec.yml\`
  $ optic diff openapi-spec.yml --base master

  Run a diff between \`openapi-spec-v0.yml\` and \`openapi-spec-v1.yml\`
  $ optic diff openapi-spec-v0.yml openapi-spec-v1.yml`;

type SpecResults = Awaited<ReturnType<typeof generateSpecResults>>;

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
      'the base ref to compare against. Defaults to master',
      'master'
    )
    .option(
      '--id <id>',
      'the id of the spec to run against in defined in the `optic.yml` file'
    )
    .action(
      wrapActionHandlerWithSentry(
        async (
          file1: string | undefined,
          file2: string | undefined,
          options: {
            base: string;
            id?: string;
          }
        ) => {
          const webBase =
            process.env.OPTIC_ENV === 'staging'
              ? 'https://app.o3c.info'
              : 'https://app.useoptic.com';

          if (file1 && file2) {
            const baseFilePath = file1;
            const headFilePath = file2;
            const [baseFile, headFile] = await Promise.all([
              getFileFromFsOrGit(baseFilePath),
              getFileFromFsOrGit(headFilePath),
            ]);
            const compressedData = compressData(baseFile, headFile);
            openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);
            // const lintResult = await lint(baseFile, headFile);
            // console.log(lintResult);

            // const compressedData = compressData(baseFile, headFile);
            // console.log(compressedData.length);
            // openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);
          } else if (file1) {
            const commandVariant = `optic diff <file> --base <ref>`;
            if (config.vcs !== VCS.Git) {
              console.error(
                `Error: ${commandVariant} must be called from a git repository.`
              );
              return;
            }

            const gitRoot = config.root;

            const { baseFile, headFile } = await parseFilesFromRef(
              file1,
              options.base,
              gitRoot
            );
            const compressedData = compressData(baseFile, headFile);
            openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);

            // const lintResult = await lint(baseFile, headFile);
            // console.log(lintResult);

            // const compressedData = compressData(baseFile, headFile);
            // console.log(compressedData.length);
            // openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);
          } else if (options.id) {
            const commandVariant = `optic diff --id <id> --base <ref>`;
            if (config.vcs !== VCS.Git) {
              console.error(
                `Error: ${commandVariant} must be called from a git repository.`
              );
              return;
            }
            if (!config.configPath) {
              console.error(
                `Error: no optic.yml config file was found. optic.yml must be included for ${commandVariant}`
              );
              return;
            }

            const gitRoot = config.root;

            console.log('Running diff against files from optic.yml file');
            const files = config.files;
            const maybeMatchingFile = files.find(
              (file) => file.id === options.id
            );

            if (maybeMatchingFile) {
              const { baseFile, headFile } = await parseFilesFromRef(
                maybeMatchingFile.path,
                options.base,
                gitRoot
              );
              const compressedData = compressData(baseFile, headFile);
              openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);
            } else {
              console.error(
                `id: ${options.id} was not found in the optic.yml file`
              );
              console.log(
                `valid list of file names: ${files
                  .map((file) => file.id)
                  .join(', ')}`
              );
            }
          } else {
            console.error('Invalid combination of arguments');
            console.log(helpText);
          }
        }
      )
    );
};

// TODO consolidate this with the `cloud-compare` git parsing function `parseFileInputs`
const parseFilesFromRef = async (
  filePath: string,
  base: string,
  rootGitPath: string
): Promise<{
  baseFile: ParseResult;
  headFile: ParseResult;
}> => {
  const absolutePath = path.join(rootGitPath, filePath);
  const pathFromGitRoot = filePath.replace(/^\.(\/|\\)/, '');
  const fileExistsOnBasePromise = exec(`git show ${base}:${pathFromGitRoot}`)
    .then(() => true)
    .catch(() => false);
  const fileExistsOnHeadPromise = fs
    .access(absolutePath)
    .then(() => true)
    .catch(() => false);

  const [existsOnBase, existsOnHead] = await Promise.all([
    fileExistsOnBasePromise,
    fileExistsOnHeadPromise,
  ]);

  return {
    baseFile: await specFromInputToResults(
      parseSpecVersion(
        existsOnBase ? `${base}:${pathFromGitRoot}` : undefined,
        defaultEmptySpec
      ),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike);
      return results;
    }),
    headFile: await specFromInputToResults(
      parseSpecVersion(
        existsOnHead ? absolutePath : undefined,
        defaultEmptySpec
      ),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike);
      return results;
    }),
  };
};

// filePathOrRef can be a path, or a gitref:path (delimited by `:`)
const getFileFromFsOrGit = async (
  filePathOrRef: string
): Promise<ParseResult> => {
  const file = await specFromInputToResults(
    parseSpecVersion(filePathOrRef, defaultEmptySpec),
    process.cwd()
  ).then((results) => {
    validateOpenApiV3Document(results.jsonLike);
    return results;
  });
  return file;
};

const compressData = (baseFile: ParseResult, headFile: ParseResult): string => {
  const dataToCompress = {
    base: baseFile.jsonLike,
    head: headFile.jsonLike,
  };
  // TODO maybe strip out unnecessary things here?
  // We could strip out:
  // - components that do not have a `$ref` key - they should be flattened, except for any circular refs
  const compressed = brotli.compress(
    Buffer.from(JSON.stringify(dataToCompress))
  );
  const urlSafeString = Buffer.from(compressed).toString('base64');
  return urlSafeString;
};

const openBrowserToPage = async (url: string) => {
  await open(url, { wait: false });
};

const lint = async (
  fromSpec: ParseResult,
  toSpec: ParseResult
): Promise<SpecResults> => {
  const rules = [new BreakingChangesRuleset()];
  const ruleRunner = new RuleRunner(rules);

  return generateSpecResults(ruleRunner, fromSpec, toSpec, null);
};
