import fs from 'node:fs/promises';
import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { defaultEmptySpec } from '@useoptic/openapi-utilities';

import {
  ParseResult,
  parseSpecVersion,
  specFromInputToResults,
} from '@useoptic/optic-ci/build/cli/commands/utils';
import { validateOpenApiV3Document } from '@useoptic/openapi-io';
import { filePathToGitPath } from '@useoptic/openapi-io';

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
    validateOpenApiV3Document(results.jsonLike, results.sourcemap);
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
  const gitFileName = filePathToGitPath(rootGitPath, filePath);
  const fileExistsOnBasePromise = exec(`git show ${base}:${gitFileName}`)
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
        existsOnBase ? `${base}:${gitFileName}` : undefined,
        defaultEmptySpec
      ),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike, results.sourcemap);
      return results;
    }),
    headFile: await specFromInputToResults(
      parseSpecVersion(
        existsOnHead ? absolutePath : undefined,
        defaultEmptySpec
      ),
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike, results.sourcemap);
      return results;
    }),
    pathFromGitRoot: gitFileName,
  };
};
