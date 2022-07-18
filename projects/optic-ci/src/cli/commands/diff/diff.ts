import { Command } from 'commander';
import brotli from 'brotli';
import open from 'open';
import {
  defaultEmptySpec,
  validateOpenApiV3Document,
} from '@useoptic/openapi-utilities';
import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  ParseResult,
  parseSpecVersion,
  specFromInputToResults,
} from '../utils';

export const registerDiff = (cli: Command, hideCommand: boolean) => {
  cli
    .command(
      'diff',
      // TODO unhide when ready to launch
      {
        hidden: true,
      }
      // hideCommand
      //   ? {
      //       hidden: true,
      //     }
      //   : {}
    )
    // .description()
    // .summary()
    // .usage('./openapi-spec.yml master:openapi-spec/yml')
    // .usage('./openapi-spec.yml --base master')
    .argument('<file>', 'path to file to compare')
    .argument('[compare_with_file]', 'path to file to compare with')
    .option('--base <base>', 'the base ref to compare against')
    .action(
      wrapActionHandlerWithSentry(
        // TODO document this well=
        // Either is diff <before> <after>
        // or
        // diff --base ref (uses optic.yml)
        // or
        // diff <filepath> --base ref
        async (
          file1: string,
          file2: string | undefined,
          options: {
            base?: string;
          }
        ) => {
          const webBase =
            process.env.OPTIC_ENV === 'staging'
              ? 'https://app.o3c.info'
              : 'https://app.useoptic.com';

          // TODO check for optic.yml and --base
          if (file2) {
            const baseFilePath = file1;
            const headFilePath = file2;
            const [baseFile, headFile] = await Promise.all([
              getFileFromFsOrGit(baseFilePath),
              getFileFromFsOrGit(headFilePath),
            ]);
            const compressedData = compressData(baseFile, headFile);
            console.log(compressedData.length);
            openBrowserToPage(`${webBase}/cli/diff#${compressedData}`);
          } else if (options.base) {
            // TODO check if in git repo
            // TODO implement
          } else {
            // TODO error
          }
        }
      )
    );
};

const getFileFromDifferentRef = (filePath: string, ref: string) => {
  // TODO implement
};

const getFilesFromOpticyml = (ref: string) => {};

// filePathOrRef can be a path, or a gitref:path (delimited by `:`)
const getFileFromFsOrGit = async (filePathOrRef: string) => {
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
