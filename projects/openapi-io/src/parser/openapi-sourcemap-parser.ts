import $RefParser from '@apidevtools/json-schema-ref-parser';
// @ts-ignore
import * as $RefParserOptions from '@apidevtools/json-schema-ref-parser/lib/options';
// @ts-ignore
import { dereference } from './insourced-dereference';
import path from 'path';

import fetch from 'node-fetch';
import { OpenAPIV3 } from 'openapi-types';
import isUrl from 'is-url';

import { JsonSchemaSourcemap } from './sourcemap';
import { gitBranchResolver } from './resolvers/git-branch-file-resolver';
import { ExternalRefHandler } from './types';
import Bottleneck from 'bottleneck';
// @ts-ignore
import * as customYaml from './insourced-yaml';

export {
  JSONParserError,
  ResolverError,
} from '@apidevtools/json-schema-ref-parser';

export type ParseOpenAPIResult = {
  jsonLike: OpenAPIV3.Document;
  sourcemap: JsonSchemaSourcemap;
};

export async function dereferenceOpenApi(
  path: string,
  options: {
    externalRefHandler?: ExternalRefHandler;
  } = {}
): Promise<ParseOpenAPIResult> {
  const resolver = new $RefParser();

  const sourcemap = new JsonSchemaSourcemap(path);
  const resolve = {
    file: options.externalRefHandler,
    http: {
      headers: {
        accept: '*/*',
      },
    },
    external: true,
  };
  // Resolve all references
  const resolverResults: $RefParser.$Refs = await resolver.resolve(path, {
    resolve,
    parse: {
      yaml: customYaml,
    },
  });

  const limiter = new Bottleneck({
    maxConcurrent: 20,
  });

  // parse all asts and add to sourcemap
  const cachedUrls = new Set<string>([]);

  await Promise.all(
    resolverResults.paths().map((filePath, index) =>
      limiter.schedule(async () => {
        if (isUrl(filePath)) {
          const inCache = cachedUrls.has(filePath);
          if (!inCache) {
            const response = await fetch(filePath);
            const contents = await response.text();
            cachedUrls.add(filePath);
            sourcemap.addFileIfMissingFromContents(filePath, contents, index);
          }
        } else if (options.externalRefHandler) {
          const contents = await options.externalRefHandler.read({
            url: filePath,
          });
          sourcemap.addFileIfMissingFromContents(filePath, contents, index);
        } else {
          await sourcemap.addFileIfMissing(filePath, index);
        }
      })
    )
  );

  // Dereference all references
  dereference(
    resolver,
    {
      ...$RefParserOptions.defaults,
      path: path,
      dereference: { circular: 'ignore' },
      resolve,
      parse: {
        yaml: customYaml,
      },
    },
    sourcemap
  );

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap };
}

export async function parseOpenAPIWithSourcemap(
  path: string
): Promise<ParseOpenAPIResult> {
  return dereferenceOpenApi(path);
}

export async function parseOpenAPIFromRepoWithSourcemap(
  name: string,
  repoPath: string,
  branch: string
): Promise<ParseOpenAPIResult> {
  const inGitResolver = gitBranchResolver(repoPath, branch);
  const fileName = path.join(repoPath, name);
  return dereferenceOpenApi(fileName, { externalRefHandler: inGitResolver });
}
