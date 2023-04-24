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
import { OPTIC_EMPTY_SPEC_KEY } from '../constants';

const exec = promisify(callbackExec);

export type ParseResultContext = {
  vcs: 'git';
  sha: string;
  effective_at?: Date;
  name: string;
  email: string;
  message: string;
} | null;

export type ParseResult = ParseOpenAPIResult & {
  isEmptySpec: boolean;
  context: ParseResultContext;
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
  raw = raw ?? 'null:';
  if (raw === 'null:') {
    return {
      from: 'empty',
      value: {
        ...defaultEmptySpec,
        [OPTIC_EMPTY_SPEC_KEY]: true,
      } as OpenAPIV3.Document,
    };
  } else if (
    raw.includes(':') &&
    !(raw.startsWith('C:') || raw.startsWith('D:'))
  ) {
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
}

// Loads spec without dereferencing
export async function loadRaw(
  filePathOrRef: string
): Promise<OpenAPIV3.Document> {
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
      const sourcemap = new JsonSchemaSourcemap(emptySpecName);
      sourcemap.addFileIfMissingFromContents(
        emptySpecName,
        JSON.stringify(input.value, null, 2),
        0
      );

      return {
        jsonLike: input.value,
        sourcemap,
        isEmptySpec: true,
        context: null,
      };
    }
    case 'git': {
      if (config.vcs?.type !== VCS.Git) {
        throw new Error(`${workingDir} is not a git repo`);
      }

      const sha = await Git.resolveGitRef(input.branch);
      const commitMeta = await Git.commitMeta(sha);

      return {
        ...(await parseOpenAPIFromRepoWithSourcemap(
          input.name,
          config.root,
          input.branch
        )),
        isEmptySpec: false,
        context: {
          vcs: 'git',
          sha,
          effective_at: commitMeta.date,
          name: commitMeta.name,
          email: commitMeta.email,
          message: commitMeta.message,
        },
      };
    }
    case 'file':
      let context: ParseResultContext = null;
      const parseResult = await parseOpenAPIWithSourcemap(
        path.resolve(workingDir, input.filePath)
      );

      if (
        config.vcs?.type === VCS.Git &&
        !specHasUncommittedChanges(parseResult.sourcemap, config.vcs.diffSet)
      ) {
        const commitMeta = await Git.commitMeta(config.vcs.sha);

        context = {
          vcs: 'git',
          sha: config.vcs.sha,
          effective_at: commitMeta.date,
          name: commitMeta.name,
          email: commitMeta.email,
          message: commitMeta.message,
        };
      }

      return {
        ...parseResult,
        isEmptySpec: false,
        context,
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
    headStrict: boolean;
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
        strict: options.headStrict,
      });
    }),
    pathFromGitRoot: gitFileName,
  };
};

export const specHasUncommittedChanges = (
  sourcemap: JsonSchemaSourcemap,
  diffSet: Set<string>
): boolean => {
  // resolve absolute paths - in this case, if the path refers to a url or git ref, we don't care about it
  // since its outside of the current working directory
  const specFiles = sourcemap.files.map((f) => path.resolve(f.path));
  return specFiles.some((f) => diffSet.has(f));
};
