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
  denormalize,
  loadYaml,
} from '@useoptic/openapi-io';
import { OpticCliConfig, VCS } from '../config';
import * as Git from './git-utils';

const exec = promisify(callbackExec);

export type ParseResult = ParseOpenAPIResult & {
  isEmptySpec: boolean;
  context: {
    vcs: 'git';
    sha: string;
  } | null;
};

type SpecFromInput =
  | {
      from: 'file';
      filePath: string;
    }
  | {
      from: 'git';
      branch: string;
      name: string;
    }
  | {
      from: 'empty';
      value: OpenAPIV3.Document;
    };

export function parseSpecVersion(raw?: string | null): SpecFromInput {
  if (raw) {
    if (raw.includes(':') && !(raw.startsWith('C:') || raw.startsWith('D:'))) {
      const index = raw.indexOf(':');
      const rev = raw.substring(0, index);
      const name = raw.substring(index + 1);

      return {
        from: 'git',
        name: name.startsWith('/') ? name.substring(1) : name,
        branch: rev,
      };
    } else {
      return {
        from: 'file',
        filePath: raw,
      };
    }
  } else {
    return {
      from: 'empty',
      value: defaultEmptySpec,
    };
  }
}

// Loads spec without dereferencing
export async function loadRaw(filePathOrRef: string): Promise<any> {
  const input = parseSpecVersion(filePathOrRef);
  let rawString: string;
  if (input.from === 'file') {
    rawString = await fs.readFile(filePathOrRef, 'utf-8');
  } else if (input.from === 'git') {
    rawString = await Git.gitShow(input.branch, input.name);
  } else {
    return input.value;
  }

  try {
    return /\.json$/i.test(filePathOrRef)
      ? JSON.parse(rawString)
      : loadYaml(rawString);
  } catch (e) {
    if (e instanceof Error) {
      if (rawString.match(/x-optic-url/)) {
        e['probablySpec'] = true;
      }
    }

    throw e;
  }
}

async function parseSpecAndDereference(
  filePathOrRef: string | undefined,
  config: OpticCliConfig
): Promise<ParseResult> {
  const workingDir = process.cwd();
  const input = parseSpecVersion(filePathOrRef);

  switch (input.from) {
    case 'empty': {
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
    case 'git': {
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
          sha: await Git.resolveGitRef(input.branch),
        },
      };
    }
    case 'file':
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

function validateAndDenormalize(
  parseResult: ParseResult,
  options: {
    strict: boolean;
    denormalize: boolean;
  }
): ParseResult {
  validateOpenApiV3Document(parseResult.jsonLike, parseResult.sourcemap, {
    strictOpenAPI: options.strict,
  });

  return options.denormalize ? denormalize(parseResult) : parseResult;
}

// filePathOrRef can be a path, or a gitref:path (delimited by `:`)
export const getFileFromFsOrGit = async (
  filePathOrRef: string | undefined,
  config: OpticCliConfig,
  options: {
    strict: boolean;
    denormalize: boolean;
  }
): Promise<ParseResult> => {
  const file = await parseSpecAndDereference(filePathOrRef, config);

  return validateAndDenormalize(file, options);
};

export const parseFilesFromRef = async (
  filePath: string,
  base: string,
  rootGitPath: string,
  config: OpticCliConfig,
  options: {
    denormalize: boolean;
  }
): Promise<{
  baseFile: ParseResult;
  headFile: ParseResult;
  pathFromGitRoot: string;
}> => {
  const absolutePath = path.resolve(filePath);
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
    baseFile: await parseSpecAndDereference(
      existsOnBase ? `${base}:${gitFileName}` : undefined,
      config
    ).then((file) => {
      return validateAndDenormalize(file, {
        denormalize: options.denormalize,
        strict: false,
      });
    }),
    headFile: await parseSpecAndDereference(
      existsOnHead ? absolutePath : undefined,
      config
    ).then((file) => {
      return validateAndDenormalize(file, {
        denormalize: options.denormalize,
        strict: true,
      });
    }),
    pathFromGitRoot: gitFileName,
  };
};
