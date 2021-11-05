import $RefParser from "@apidevtools/json-schema-ref-parser";
// @ts-ignore
import * as $RefParserOptions from "@apidevtools/json-schema-ref-parser/lib/options";
import * as YAML from "yaml-ast-parser";
import * as fs from "fs-extra";
import { YAMLMapping, YAMLNode, YAMLSequence } from "yaml-ast-parser";
// @ts-ignore
import { dereference } from "./insourced-dereference";
import * as pointer from "json-ptr";
import path from "path";
import fetch from "node-fetch";
import { OpenAPIV3 } from "openapi-types";
import sortBy from "lodash.sortby";

export type ParseOpenAPIResult = {
  jsonLike: OpenAPIV3.Document;
  sourcemap: JsonSchemaSourcemapOutput;
};

export async function parseOpenAPIWithSourcemap(
  path: string
): Promise<ParseOpenAPIResult> {
  const resolver = new $RefParser();

  const sourcemap = new JsonSchemaSourcemap();
  const resolverResults: $RefParser.$Refs = await resolver.resolve(path, {
    resolve: {
      http: {
        headers: {
          accept: "*/*",
        },
      },
    },
  });

  // parse all asts
  await Promise.all(
    resolverResults
      .paths()
      .map((filePath, index) => sourcemap.addFileIfMissing(filePath, index))
  );

  dereference(
    resolver,
    { ...$RefParserOptions.defaults, path: path },
    sourcemap
  );

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap.serialize() };
}

export async function parseOpenAPIFromRepoWithSourcemap(
  name: string,
  repoPath: string,
  branch: string
): Promise<ParseOpenAPIResult> {
  const newGitBranchResolver = require("./git-branch-file-resolver.js");

  const inGitResolver = newGitBranchResolver(repoPath, branch);
  const resolver = new $RefParser();
  const fileName = path.join(repoPath, name);

  const sourcemap = new JsonSchemaSourcemap();
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

  async addFileIfMissing(filePath: string, fileIndex: number) {
    if (filePath.startsWith("http")) {
      const response = await fetch(filePath);
      const asText = await response.text();

      const yamlAst: YAMLNode = YAML.safeLoad(asText);

      this._files.push({
        path: filePath,
        index: fileIndex,
        ast: yamlAst,
      });
    } else {
      if (!this._files.find((i) => i.path === filePath)) {
        // add the ast to the cache
        const yamlAst: YAMLNode = YAML.safeLoad(
          (await fs.readFile(filePath)).toString()
        );

        this._files.push({
          path: filePath,
          index: fileIndex,
          ast: yamlAst,
        });
      }
    }
  }

  async addFileIfMissingFromContents(
    filePath: string,
    contents: string,
    fileIndex: number
  ) {
    if (!this._files.find((i) => i.path === filePath)) {
      // add the ast to the cache
      const yamlAst: YAMLNode = YAML.safeLoad(contents);

      this._files.push({
        path: filePath,
        index: fileIndex,
        ast: yamlAst,
      });
    }
  }

  log(path: string, pathFromRoot: string) {
    // this seems to assume that paths will be in order, why not check for equality?
    const thisFile = this._files.find((i) => path.startsWith(i.path));
    if (thisFile) {
      const jsonPointer = path.split(thisFile.path)[1].substring(1) || "/";
      const sourceMapping = resolveJsonPointerInYamlAst(
        thisFile.ast,
        jsonPointer,
        thisFile.index
      );
      if (sourceMapping) {
        this._mappings.push([pathFromRoot, sourceMapping]);
      }
    }
  }

  public serialize(): JsonSchemaSourcemapOutput {
    return {
      files: sortBy(
        this._files.map((i) => ({ path: i.path, index: i.index })),
        "index"
      ),
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

  if (isEmpty)
    return { node: [node.startPosition, node.endPosition], file: file };

  const found: YAMLNode | undefined = decoded.reduce((current, path) => {
    if (!current) return undefined;
    const node: YAMLNode = current.key ? current.value : current;
    const isNumericalKey =
      !isNaN(Number(path)) && (node as any).hasOwnProperty("items");

    if (isNumericalKey) {
      return (node as YAMLSequence).items[Number(path)];
    } else {
      const field = node.mappings.find(
        (i: YAMLMapping) => i.key.value === path
      );
      return field;
    }
  }, node as YAMLNode | undefined);

  if (found) {
    if (found.key) {
      // is a field
      return {
        key: [found.key.startPosition, found.key.endPosition],
        value: [found.value.startPosition, found.value.endPosition],
        node: [found.startPosition, found.endPosition],
        file: file,
      };
    } else {
      return { node: [found.startPosition, found.endPosition], file: file };
    }
  }
}

type AstLocation = [number, number];
interface LocationRecord {
  key?: AstLocation;
  value?: AstLocation;
  node: AstLocation;
  file: number;
}
