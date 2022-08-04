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

export { JSONParserError } from '@apidevtools/json-schema-ref-parser';

export type ParseOpenAPIResult = {
  jsonLike: OpenAPIV3.Document;
  sourcemap: JsonSchemaSourcemap;
};

type ExternalRefHandler = {
  order: number;
  canRead: (file: { url: string }) => boolean;
  read: (file: { url: string }) => Promise<string>;
};

async function dereferenceOpenApi(
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
  };
  // Resolve all references
  const resolverResults: $RefParser.$Refs = await resolver.resolve(path, {
    resolve,
  });

  // parse all asts and add to sourcemap
  await Promise.all(
    resolverResults.paths().map(async (filePath, index) => {
      if (isUrl(filePath)) {
        const response = await fetch(filePath);
        const contents = await response.text();
        sourcemap.addFileIfMissingFromContents(filePath, contents, index);
      } else if (options.externalRefHandler) {
        const contents = await options.externalRefHandler.read({
          url: filePath,
        });
        sourcemap.addFileIfMissingFromContents(filePath, contents, index);
      } else {
        await sourcemap.addFileIfMissing(filePath, index);
      }
    })
  );

  // Dereference all references
  dereference(
    resolver,
    {
      ...$RefParserOptions.defaults,
      path: path,
      dereference: { circular: 'ignore' },
      resolve,
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
  const newGitBranchResolver = require('./git-branch-file-resolver.js');

  const inGitResolver = newGitBranchResolver(repoPath, branch);
  const fileName = path.join(repoPath, name);
  return dereferenceOpenApi(fileName, { externalRefHandler: inGitResolver });
}
