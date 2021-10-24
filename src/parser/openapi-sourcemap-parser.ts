import $RefParser from "@apidevtools/json-schema-ref-parser";
// @ts-ignore
import * as $RefParserOptions from "@apidevtools/json-schema-ref-parser/lib/options";
import * as YAML from "yaml-ast-parser";
import * as fs from "fs-extra";
import { YAMLMapping, YAMLNode, YAMLSequence } from "yaml-ast-parser";
// @ts-ignore
import { dereference } from "./insourced-dereference";
import * as pointer from "json-ptr";
const newGitBranchResolver = require("./git-branch-file-resolver")
import path from 'path'


export async function parseOpenAPIWithSourcemap(path: string) {
  const resolver = new $RefParser();

  const sourcemap = new JsonSchemaSourcemap();
  const resolverResults: $RefParser.$Refs = await resolver.resolve(path);

  // parse all asts
  await Promise.all(
    resolverResults
      .paths()
      .map((filePath) => sourcemap.addFileIfMissing(filePath))
  );

  dereference(
    resolver,
    { ...$RefParserOptions.defaults, path: path },
    sourcemap
  );

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap.serialize() };
}

export async function parseOpenAPIFromRepoWithSourcemap(name: string, repoPath: string, branch: string) {
  const inGitResolver = newGitBranchResolver(repoPath, branch)
  const resolver = new $RefParser();
  const fileName = path.join(repoPath, name)

  const sourcemap = new JsonSchemaSourcemap();
  const resolverResults: $RefParser.$Refs = await resolver.resolve(fileName, {resolve: {file: inGitResolver}});

  // parse all asts
  await Promise.all(
    resolverResults
      .paths()
      .map(async (filePath) => {
        return await sourcemap.addFileIfMissingFromContents(filePath, await inGitResolver.read({url: filePath}))
      })
  );

  dereference(
    resolver,
    { ...$RefParserOptions.defaults, path: fileName, resolve: {file: inGitResolver} },
    sourcemap
  );

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap.serialize() };
}

type JsonPath = string;
type FileReference = number;

type DerefToSource = [JsonPath, LocationRecord];

export interface JsonSchemaSourcemapOutput {
  files: Array<{
    path: string;
    index: number;
  }>;
  map: DerefToSource[];
}

export class JsonSchemaSourcemap {
  private _files: Array<{
    path: string;
    index: number;
    ast: YAMLNode;
  }> = [];

  private _mappings: Array<DerefToSource> = [];

  async addFileIfMissing(filePath: string) {
    if (!this._files.find((i) => i.path === filePath)) {
      // add the ast to the cache
      const yamlAst: YAMLNode = YAML.safeLoad(
        (await fs.readFile(filePath)).toString()
      );

      this._files.push({
        path: filePath,
        index: this._files.length,
        ast: yamlAst,
      });
    }
  }

  async addFileIfMissingFromContents(filePath: string, contents: string) {
    if (!this._files.find((i) => i.path === filePath)) {
      // add the ast to the cache
      const yamlAst: YAMLNode = YAML.safeLoad(
        contents
      );

      this._files.push({
        path: filePath,
        index: this._files.length,
        ast: yamlAst,
      });
    }
  }

  log(path: string, pathFromRoot: string) {
    const thisFile = this._files.find((i) => path.startsWith(i.path));
    if (thisFile) {
      const jsonPointer = path.split(thisFile.path)[1].substring(1) || "/";
      // @todo remove this try catch, we want errors, but this is going to help us dev
      try {
        const sourceMapping = resolveJsonPointerInYamlAst(
          thisFile.ast,
          jsonPointer,
          thisFile.index
        );
        if (sourceMapping) {
          this._mappings.push([pathFromRoot, sourceMapping]);
        }
      } catch (e) {
        console.error("source mapping failure ", e)
      }
    }
  }

  public serialize(): JsonSchemaSourcemapOutput {
    return {
      files: this._files.map((i) => ({ path: i.path, index: i.index })),
      map: this._mappings,
    };
  }
}

export function resolveJsonPointerInYamlAst(
  node: YAMLNode,
  jsonPointer: string,
  file: number
): LocationRecord | undefined {
  const decoded = pointer.decodePointer(jsonPointer);

  const isEmpty =
    decoded.length === 0 || (decoded.length === 1 && decoded[0] === "");

  if (isEmpty) return { n: [node.startPosition, node.endPosition], f: file };

  const found: YAMLNode | undefined = decoded.reduce((current, path) => {
    const isFieldKey = isNaN(Number(path));
    if (!current) return undefined;

    const node: YAMLNode = current.key ? current.value : current;

    if (isFieldKey) {
      const field = node.mappings.find(
        (i: YAMLMapping) => i.key.value === path
      );
      return field;
    } else {
      // is number
      return (node as YAMLSequence).items[Number(path)];
    }
  }, node as YAMLNode | undefined);

  if (found) {
    if (found.key) {
      // is a field
      return {
        k: [found.key.startPosition, found.key.endPosition],
        v: [found.value.startPosition, found.value.endPosition],
        n: [found.startPosition, found.endPosition],
        f: file,
      };
    } else {
      return { n: [found.startPosition, found.endPosition], f: file };
    }
  }
}

type AstLocation = [number, number];
interface LocationRecord {
  k?: AstLocation;
  v?: AstLocation;
  n: AstLocation;
  f: number;
}
