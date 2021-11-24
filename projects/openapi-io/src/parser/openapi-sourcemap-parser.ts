import $RefParser from '@apidevtools/json-schema-ref-parser';
// @ts-ignore
import * as $RefParserOptions from '@apidevtools/json-schema-ref-parser/lib/options';
import * as YAML from 'yaml-ast-parser';
import { YAMLMapping, YAMLNode, YAMLSequence } from 'yaml-ast-parser';
import * as fs from 'fs-extra';
// @ts-ignore
import { dereference } from './insourced-dereference';
import path from 'path';
import fetch from 'node-fetch';
import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export type ParseOpenAPIResult = {
  jsonLike: OpenAPIV3.Document;
  sourcemap: JsonSchemaSourcemap;
};

export async function parseOpenAPIWithSourcemap(
  path: string
): Promise<ParseOpenAPIResult> {
  const resolver = new $RefParser();

  const sourcemap = new JsonSchemaSourcemap(path);
  const resolverResults: $RefParser.$Refs = await resolver.resolve(path, {
    resolve: {
      http: {
        headers: {
          accept: '*/*',
        },
      },
    },
  });

  // parse all asts
  await Promise.all(
    resolverResults
      .paths()
      .map(async (filePath, index) =>
        sourcemap.addFileIfMissing(filePath, index)
      )
  );

  dereference(
    resolver,
    {
      ...$RefParserOptions.defaults,
      path: path,
    },
    sourcemap
  );

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap };
}

export async function parseOpenAPIFromRepoWithSourcemap(
  name: string,
  repoPath: string,
  branch: string
): Promise<ParseOpenAPIResult> {
  const newGitBranchResolver = require('./git-branch-file-resolver.js');

  const inGitResolver = newGitBranchResolver(repoPath, branch);
  const resolver = new $RefParser();
  const fileName = path.join(repoPath, name);

  const sourcemap = new JsonSchemaSourcemap(fileName);
  const resolverResults: $RefParser.$Refs = await resolver.resolve(fileName, {
    resolve: { file: inGitResolver },
  });

  // parse all asts
  await Promise.all(
    resolverResults.paths().map(async (filePath, index) => {
      return await sourcemap.addFileIfMissingFromContents(
        filePath,
        await inGitResolver.read({ url: filePath }),
        index
      );
    })
  );

  dereference(
    resolver,
    {
      ...$RefParserOptions.defaults,
      path: fileName,
      resolve: { file: inGitResolver },
    },
    sourcemap
  );

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap };
}

export type JsonPath = string;
export type JsonPathExploded = string[];
export type FileReference = number;

export type DerefToSource = [YAMLNode, FileReference, JsonPath];
export type ToSource = [FileReference, JsonPath];

// assumptions change because not serializing
export class JsonSchemaSourcemap {
  constructor(public rootFilePath: string) {}

  public files: Array<{
    path: string;
    index: number;
    ast: YAMLNode;
  }> = [];

  public refMappings: { [key: JsonPath]: ToSource } = {};

  async addFileIfMissing(filePath: string, fileIndex: number) {
    if (filePath.startsWith('http')) {
      const response = await fetch(filePath);
      const asText = await response.text();

      const yamlAst: YAMLNode = YAML.safeLoad(asText);

      this.files.push({
        path: filePath,
        index: fileIndex,
        ast: yamlAst,
      });
    } else {
      if (!this.files.find((i) => i.path === filePath)) {
        // add the ast to the cache
        const yamlAst: YAMLNode = YAML.safeLoad(
          (await fs.readFile(filePath)).toString()
        );

        this.files.push({
          path: filePath,
          index: fileIndex,
          ast: yamlAst,
        });
      }
    }
  }

  addFileIfMissingFromContents(
    filePath: string,
    contents: string,
    fileIndex: number
  ) {
    if (!this.files.find((i) => i.path === filePath)) {
      // add the ast to the cache
      const yamlAst: YAMLNode = YAML.safeLoad(contents);

      this.files.push({
        path: filePath,
        index: fileIndex,
        ast: yamlAst,
      });
    }
  }

  logPointer(pathRelativeToFile: string, pathRelativeToRoot: string) {
    // console.log(pathRelativeToFile, pathRelativeToRoot);
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

type AstLocation = [number, number];
interface LocationRecord {
  key?: AstLocation;
  value?: AstLocation;
  node: AstLocation;
  file: number;
}
