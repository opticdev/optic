import fs from 'node:fs/promises';
import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import {
  defaultEmptySpec,
  validateOpenApiV3Document,
} from '@useoptic/openapi-utilities';

import {
  ParseResult,
  parseSpecVersion,
  specFromInputToResults,
} from '@useoptic/optic-ci/build/cli/commands/utils';

const exec = promisify(callbackExec);

export type { ParseResult };

// filePathOrRef can be a path, or a gitref:path (delimited by `:`)
export const getFileFromFsOrGit = async (
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

export const parseFilesFromRef = async (
  filePath: string,
  base: string,
  rootGitPath: string
): Promise<{
  baseFile: ParseResult;
  headFile: ParseResult;
  pathFromGitRoot: string;
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
    pathFromGitRoot,
  };
};
