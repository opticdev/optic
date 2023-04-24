import fs from 'node:fs/promises';
import fetch from 'node-fetch';
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
    }
  | {
      from: 'url';
      url: string;
    };

export function parseSpecVersion(raw?: string | null): SpecFromInput {
  raw = raw ?? 'null:';
  let isUrl = false;

  try {
    new URL(raw);
    isUrl = true;
  } catch (e) {}

  if (raw === 'null:') {
    return {
      from: 'empty',
      value: defaultEmptySpec,
    };
  } else if (isUrl) {
    return {
      from: 'url',
      url: raw,
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
export async function loadRaw(opticRef: string): Promise<any> {
  const input = parseSpecVersion(opticRef);
  let format: 'json' | 'yml' | 'unknown';
  let rawString: string;
  if (input.from === 'file') {
    rawString = await fs.readFile(opticRef, 'utf-8');
    format = /\.json$/i.test(opticRef) ? 'json' : 'yml';
  } else if (input.from === 'git') {
    rawString = await Git.gitShow(input.branch, input.name);
    format = /\.json$/i.test(opticRef) ? 'json' : 'yml';
  } else if (input.from === 'url') {
    rawString = await fetch(input.url).then((res) => res.text());
    format = 'unknown';
  } else {
    return input.value;
  }

  if (format === 'unknown') {
    // try json, then yml
    try {
      return JSON.parse(rawString);
    } catch (e) {
      return loadYaml(rawString);
    }
  } else {
    try {
      return /\.json$/i.test(opticRef)
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
    case 'url': {
      const parseResult = await parseOpenAPIWithSourcemap(input.url);
      return {
        ...parseResult,
        isEmptySpec: false,
        context: null,
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

// Optic ref supports
// - file paths (`./specs/openapi.yml`)
// - git paths (`git:main`)
// - public urls (`https://example.com/my-openapi-spec.yml`)
// - empty files (`null:`)
// - (in the future): cloud tags (`cloud:apiId@tag`)
export const loadSpec = async (
  opticRef: string | undefined,
  config: OpticCliConfig,
  options: {
    strict: boolean;
    denormalize: boolean;
  }
): Promise<ParseResult> => {
  const file = await parseSpecAndDereference(opticRef, config);

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
