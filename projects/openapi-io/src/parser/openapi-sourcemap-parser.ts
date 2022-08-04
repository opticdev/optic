import $RefParser from '@apidevtools/json-schema-ref-parser';
// @ts-ignore
import * as $RefParserOptions from '@apidevtools/json-schema-ref-parser/lib/options';
import { YAMLMapping, YAMLNode, YAMLSequence } from 'yaml-ast-parser';
import * as fs from 'fs-extra';
// @ts-ignore
import { dereference } from './insourced-dereference';
import path from 'path';
import sha256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

import fetch from 'node-fetch';
import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import isUrl from 'is-url';

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

export type JsonPath = string;
export type FileReference = number;

export type ToSource = [FileReference, JsonPath];

export class JsonSchemaSourcemap {
  constructor(public rootFilePath: string) {}

  public files: Array<{
    path: string;
    index: number;
    contents: string;
    sha256: string;
  }> = [];

  public refMappings: { [key: JsonPath]: ToSource } = {};

  async addFileIfMissing(filePath: string, fileIndex: number) {
    if (!this.files.find((i) => i.path === filePath)) {
      const contents = (await fs.readFile(filePath)).toString();

      this.files.push({
        path: filePath,
        sha256: Hex.stringify(sha256(contents)),
        contents,
        index: fileIndex,
      });
    }
  }

  addFileIfMissingFromContents(
    filePath: string,
    contents: string,
    fileIndex: number
  ) {
    if (!this.files.find((i) => i.path === filePath)) {
      this.files.push({
        path: filePath,
        index: fileIndex,
        contents,
        sha256: Hex.stringify(sha256(contents)),
      });
    }
  }

  logPointer(pathRelativeToFile: string, pathRelativeToRoot: string) {
    const thisFile = this.files.find((i) =>
      pathRelativeToFile.startsWith(i.path)
    );

    if (thisFile) {
      const rootKey = jsonPointerHelpers.unescapeUriSafePointer(
        pathRelativeToRoot.substring(1)
      );

      const jsonPointer = jsonPointerHelpers.unescapeUriSafePointer(
        pathRelativeToFile.split(thisFile.path)[1].substring(1) || '/'
      );

      if (rootKey === jsonPointer) return;

      this.refMappings[rootKey] = [thisFile.index, jsonPointer];
    }
  }
}
export function resolveJsonPointerInYamlAst(
  node: YAMLNode, // root ast
  pointer: string
): YAMLNode | undefined {
  const decoded = jsonPointerHelpers.decode(pointer);
  const isEmpty =
    decoded.length === 0 || (decoded.length === 1 && decoded[0] === '');

  if (isEmpty) return node;

  const found: YAMLNode | undefined = decoded.reduce((current, path) => {
    if (!current) return undefined;
    const node: YAMLNode = current.key ? current.value : current;
    const isNumericalKey =
      !isNaN(Number(path)) && (node as any).hasOwnProperty('items');

    if (isNumericalKey) {
      return (node as YAMLSequence).items[Number(path)];
    } else {
      const field = node.mappings.find(
        (i: YAMLMapping) => i.key.value === path
      );
      return field;
    }
  }, node as YAMLNode | undefined);

  return found;
}
