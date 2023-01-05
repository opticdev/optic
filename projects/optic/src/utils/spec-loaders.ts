import fs from 'node:fs/promises';
import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import {
  validateOpenApiV3Document,
  filePathToGitPath,
  JsonSchemaSourcemap,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';
import { OpticCliConfig, VCS } from '../config';
import { resolveGitRef } from './git-utils';

const exec = promisify(callbackExec);

export type ParseResult = ParseOpenAPIResult & {
  isEmptySpec: boolean;
  context: {
    vcs: 'git';
    sha: string;
  } | null;
};

enum SpecVersionFrom {
  file,
  git,
  empty,
}

type SpecFromInput =
  | {
      from: SpecVersionFrom.file;
      filePath: string;
    }
  | {
      from: SpecVersionFrom.git;
      branch: string;
      name: string;
    }
  | {
      from: SpecVersionFrom.empty;
      value: OpenAPIV3.Document;
    };

function parseSpecVersion(
  raw: string | undefined,
  defaultSpec: OpenAPIV3.Document
): SpecFromInput {
  if (raw) {
    if (raw.includes(':') && !(raw.startsWith('C:') || raw.startsWith('D:'))) {
      const index = raw.indexOf(':');
      const rev = raw.substring(0, index);
      const name = raw.substring(index + 1);

      return {
        from: SpecVersionFrom.git,
        name: name.startsWith('/') ? name.substring(1) : name,
        branch: rev,
      };
    } else {
      return {
        from: SpecVersionFrom.file,
        filePath: raw,
      };
    }
  } else {
    return {
      from: SpecVersionFrom.empty,
      value: defaultSpec,
    };
  }
}

async function specFromInputToResults(
  input: SpecFromInput,
  config: OpticCliConfig,
  workingDir: string = process.cwd()
): Promise<ParseResult> {
  switch (input.from) {
    case SpecVersionFrom.empty: {
      const emptySpecName = 'empty.json';
      const jsonLike = {
        ...input.value,
        ['x-optic-ci-empty-spec']: true,
      } as OpenAPIV3.Document;
      const sourcemap = new JsonSchemaSourcemap(emptySpecName);
      await sourcemap.addFileIfMissingFromContents(
        emptySpecName,
        JSON.stringify(jsonLike, null, 2),
        0
      );

      return {
        jsonLike,
        sourcemap,
        isEmptySpec: true,
        context: null,
      };
    }
    case SpecVersionFrom.git: {
      if (config.vcs?.type !== VCS.Git) {
        throw new Error(`${workingDir} is not a git repo`);
      }
      return {
        ...(await parseOpenAPIFromRepoWithSourcemap(
          input.name,
          config.root,
          input.branch
        )),
        isEmptySpec: false,
        context: {
          vcs: 'git',
          sha: await resolveGitRef(input.branch),
        },
      };
    }
    case SpecVersionFrom.file:
      return {
        ...(await parseOpenAPIWithSourcemap(
          path.resolve(workingDir, input.filePath)
        )),
        isEmptySpec: false,
        context:
          config.vcs?.type === VCS.Git && config.vcs.status === 'clean'
            ? {
                vcs: 'git',
                sha: config.vcs.sha,
              }
            : null,
      };
  }
}

// filePathOrRef can be a path, or a gitref:path (delimited by `:`)
export const getFileFromFsOrGit = async (
  filePathOrRef: string,
  config: OpticCliConfig
): Promise<ParseResult> => {
  const file = await specFromInputToResults(
    parseSpecVersion(filePathOrRef, defaultEmptySpec),
    config,
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
  rootGitPath: string,
  config: OpticCliConfig
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
      config,
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
      config,
      process.cwd()
    ).then((results) => {
      validateOpenApiV3Document(results.jsonLike, results.sourcemap);
      return results;
    }),
    pathFromGitRoot: gitFileName,
  };
};
