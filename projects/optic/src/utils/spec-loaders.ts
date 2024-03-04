import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import { promisify } from 'util';
import { exec as callbackExec } from 'child_process';
import {
  FlatOpenAPIV2,
  FlatOpenAPIV3,
  FlatOpenAPIV3_1,
  OpenAPIV2,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import {
  validateSwaggerV2Document,
  validateOpenApiV3Document,
  filePathToGitPath,
  parseOpenAPIFromRepoWithSourcemap,
  ParseOpenAPIResult,
  parseOpenAPIWithSourcemap,
  denormalize,
  loadYaml,
  checkOpenAPIVersion,
} from '@useoptic/openapi-io';
import { OpticCliConfig, VCS } from '../config';
import * as Git from './git-utils';
import { createNullSpec, createNullSpecSourcemap } from './specs';
import { downloadSpec } from './cloud-specs';
import { OpticBackendClient } from '../client';
import { getApiFromOpticUrl, getApiUrl } from './cloud-urls';
import { OPTIC_URL_KEY } from '../constants';
import chalk from 'chalk';
import { getDetailsForGeneration } from './generated';
import { logger } from '../logger';

const exec = promisify(callbackExec);

export type ParseResultContext =
  | {
      vcs: 'git';
      sha: string;
      effective_at?: Date;
      name: string;
      email: string;
      message: string;
    }
  | {
      vcs: 'cloud';
      specId: string;
    }
  | null;

export type ParseResult =
  | (ParseOpenAPIResult<FlatOpenAPIV2.Document> & {
      isEmptySpec: boolean;
      from: 'git' | 'file' | 'url' | 'empty' | 'cloud';
      version: '2.x.x';
      context: ParseResultContext;
    })
  | (ParseOpenAPIResult<FlatOpenAPIV3.Document> & {
      isEmptySpec: boolean;
      from: 'git' | 'file' | 'url' | 'empty' | 'cloud';
      version: '3.0.x';
      context: ParseResultContext;
    })
  | (ParseOpenAPIResult<FlatOpenAPIV3_1.Document> & {
      isEmptySpec: boolean;
      from: 'git' | 'file' | 'url' | 'empty' | 'cloud';
      version: '3.1.x';
      context: ParseResultContext;
    });

type SpecFromInput =
  | {
      from: 'cloud';
      apiId: string;
      tag: string;
    }
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
    }
  | {
      from: 'url';
      url: string;
    };

export function parseOpticRef(raw?: string | null): SpecFromInput {
  raw = raw ?? 'null:';
  let isUrl = false;
  const maybeCloudMatch = raw.match(/^cloud:(?<apiId>.+)@(?<tag>.+)$/);

  try {
    const url = new URL(raw);
    // should also check that the protocol is http or https, we won't support anything else
    isUrl = url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {}

  if (raw === 'null:') {
    return {
      from: 'empty',
    };
  } else if (isUrl) {
    return {
      from: 'url',
      url: raw,
    };
  } else if (maybeCloudMatch?.groups?.apiId && maybeCloudMatch?.groups?.tag) {
    return {
      from: 'cloud',
      apiId: maybeCloudMatch.groups.apiId,
      tag: maybeCloudMatch.groups.tag,
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
  opticRef: string,
  config: { client: OpticBackendClient }
): Promise<OpenAPIV2.Document | OpenAPIV3.Document> {
  const input = parseOpticRef(opticRef);
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
  } else if (input.from === 'cloud') {
    const spec = await downloadSpec(
      { apiId: input.apiId, tag: input.tag },
      config
    );
    return spec.jsonLike as any;
  } else {
    return createNullSpec();
  }

  if (rawString === '') {
    throw new Error('file is empty');
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
  const input = parseOpticRef(filePathOrRef);

  switch (input.from) {
    case 'empty': {
      const spec = createNullSpec();
      const sourcemap = createNullSpecSourcemap(spec);
      return {
        jsonLike: spec,
        sourcemap,
        from: 'empty',
        version: '3.0.x',
        isEmptySpec: true,
        context: null,
      };
    }
    case 'cloud': {
      // try fetch from cloud, if 404 return an error
      // todo handle empty spec case
      const { jsonLike, sourcemap, spec } = await downloadSpec(
        { apiId: input.apiId, tag: input.tag },
        config
      );
      return {
        jsonLike,
        sourcemap,
        version: checkOpenAPIVersion(jsonLike),
        from: 'cloud',
        isEmptySpec: false,
        context: {
          vcs: 'cloud',
          specId: spec.id,
        },
      } as ParseResult;
    }
    case 'git': {
      if (config.vcs?.type !== VCS.Git) {
        throw new Error(`${workingDir} is not a git repo`);
      }

      const sha = await Git.resolveGitRef(input.branch);
      const commitMeta = await Git.commitMeta(sha);
      const parseResult = await parseOpenAPIFromRepoWithSourcemap(
        input.name,
        config.root,
        input.branch,
        {
          externalRefHeaders: config.external_refs?.resolve_headers ?? [],
        }
      );

      return {
        ...parseResult,
        version: checkOpenAPIVersion(parseResult.jsonLike),
        from: 'git',
        isEmptySpec: false,
        context: {
          vcs: 'git',
          sha,
          effective_at: commitMeta.date,
          name: commitMeta.name,
          email: commitMeta.email,
          message: commitMeta.message,
        },
      } as ParseResult;
    }
    case 'url': {
      const parseResult = await parseOpenAPIWithSourcemap(input.url, {
        externalRefHeaders: config.external_refs?.resolve_headers ?? [],
      });
      return {
        ...parseResult,
        version: checkOpenAPIVersion(parseResult.jsonLike),

        from: 'url',
        isEmptySpec: false,
        context: null,
      } as ParseResult;
    }
    case 'file':
      let context: ParseResultContext = null;
      const parseResult = await parseOpenAPIWithSourcemap(
        path.resolve(workingDir, input.filePath),
        {
          externalRefHeaders: config.external_refs?.resolve_headers ?? [],
        }
      );

      if (config.vcs?.type === VCS.Git) {
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
        version: checkOpenAPIVersion(parseResult.jsonLike),
        from: 'file',
        isEmptySpec: false,
        context,
      } as ParseResult;
  }
}

function validateAndDenormalize(
  parseResult: ParseResult,
  options: {
    strict: boolean;
    denormalize: boolean;
  }
): ParseResult {
  if (parseResult.version === '2.x.x') {
    validateSwaggerV2Document(parseResult.jsonLike, parseResult.sourcemap, {
      strictOpenAPI: options.strict,
    });
  } else if (
    parseResult.version === '3.0.x' ||
    parseResult.version === '3.1.x'
  ) {
    validateOpenApiV3Document(parseResult.jsonLike, parseResult.sourcemap, {
      strictOpenAPI: options.strict,
    });
  } else {
    throw new Error('unrecognized version');
  }
  const warnings = [];
  const result = options.denormalize
    ? denormalize(parseResult, warnings)
    : parseResult;
  if (warnings.length !== 0) logger.warn(...warnings);

  return result;
}

// Optic ref supports
// - file paths (`./specs/openapi.yml`)
// - git paths (`git:main`)
// - public urls (`https://example.com/my-openapi-spec.yml`)
// - empty files (`null:`)
// - cloud tags (`cloud:apiId@tag`)
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
  await Git.assertRefExists(base);
  const gitFileName = filePathToGitPath(rootGitPath, filePath);
  const existsOnBase = await exec(`git show ${base}:${gitFileName}`)
    .then(() => true)
    .catch(() => false);

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
    headFile: await parseSpecAndDereference(filePath, config).then((file) => {
      return validateAndDenormalize(file, {
        denormalize: options.denormalize,
        strict: options.headStrict,
      });
    }),
    pathFromGitRoot: gitFileName,
  };
};

export const parseFilesFromCloud = async (
  filePath: string,
  cloudTag: string,
  config: OpticCliConfig,
  options: {
    denormalize: boolean;
    headStrict: boolean;
  }
) => {
  const headFile = await loadSpec(filePath, config, {
    denormalize: options.denormalize,
    strict: options.headStrict,
  });

  let specDetails = getApiFromOpticUrl(headFile.jsonLike[OPTIC_URL_KEY]);

  const relativePath = path.relative(config.root, path.resolve(filePath));
  const generatedDetails = await getDetailsForGeneration(config);
  if (generatedDetails) {
    const { web_url, organization_id, default_branch, default_tag } =
      generatedDetails;

    const { apis } = await config.client.getApis([relativePath], web_url);
    let url: string;
    if (!apis[0]) {
      const api = await config.client.createApi(organization_id, {
        name: relativePath,
        path: relativePath,
        web_url: web_url,
        default_branch,
        default_tag,
      });
      url = getApiUrl(config.client.getWebBase(), organization_id, api.id);
    } else {
      url = getApiUrl(
        config.client.getWebBase(),
        organization_id,
        apis[0].api_id
      );
    }
    specDetails = getApiFromOpticUrl(url);
  }

  if (!specDetails) {
    throw new Error(
      `${chalk.bold.red(
        "Must have an 'x-optic-url' in your OpenAPI spec file to be able to compare against a cloud base."
      )}.

${chalk.gray(`Get started by running 'optic api add ${filePath}'`)}`
    );
  }
  const baseFile = validateAndDenormalize(
    await parseSpecAndDereference(
      `cloud:${specDetails.apiId}@${cloudTag}`,
      config
    ),
    {
      denormalize: options.denormalize,
      strict: false,
    }
  );

  return {
    baseFile,
    headFile,
    specDetails,
  };
};
