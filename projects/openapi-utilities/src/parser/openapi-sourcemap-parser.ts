import $RefParser from "@apidevtools/json-schema-ref-parser";
// @ts-ignore
import * as $RefParserOptions from "@apidevtools/json-schema-ref-parser/lib/options";
import * as YAML from "yaml-ast-parser";
import * as fs from "fs-extra";
import { YAMLMapping, YAMLNode, YAMLSequence } from "yaml-ast-parser";
// @ts-ignore
import { dereference } from "./insourced-dereference";
import path from "path";
import fetch from "node-fetch";
import { OpenAPIV3 } from "openapi-types";
import jsonPointer from "json-pointer";
import jsonPointerHelpers from "./json-pointer-helpers";

export type ParseOpenAPIResult = {
  jsonLike: OpenAPIV3.Document;
  sourcemap: JsonSchemaSourcemap;
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

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap };
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

  return { jsonLike: resolver.schema as any, sourcemap: sourcemap };
}

export type JsonPath = string;
export type FileReference = number;

export type DerefToSource = [YAMLNode, FileReference, JsonPath];

// assumptions change because not serializing
export class JsonSchemaSourcemap {
  public files: Array<{
    path: string;
    index: number;
    ast: YAMLNode;
  }> = [];

  public mappings: { [key: JsonPath]: DerefToSource } = {};

  async addFileIfMissing(filePath: string, fileIndex: number) {
    if (filePath.startsWith("http")) {
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

  async addFileIfMissingFromContents(
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

  log(path: string, pathFromRoot: string) {
    // this seems to assume that paths will be in order, why not check for equality?
    const thisFile = this.files.find((i) => path.startsWith(i.path));
    // strip pound sign
    const rootKey = pathFromRoot.substring(1);
    if (thisFile) {
      const jsonPointer = jsonPointerHelpers.unescapeUriSafePointer(
        path.split(thisFile.path)[1].substring(1) || "/"
      );
      const sourceMapping = resolveJsonPointerInYamlAst(
        thisFile.ast,
        jsonPointer,
        thisFile.index
      );
      if (sourceMapping) {
        this.mappings[rootKey] = sourceMapping;
      }
    }
  }
}

export function resolveJsonPointerInYamlAst(
  node: YAMLNode,
  pointer: string,
  file: number
): DerefToSource | undefined {
  const decoded = jsonPointer.parse(pointer);

  const isEmpty =
    decoded.length === 0 || (decoded.length === 1 && decoded[0] === "");

  if (isEmpty) return [node, file, "/"];

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
    return [found, file, pointer];
  }
}

type AstLocation = [number, number];
interface LocationRecord {
  key?: AstLocation;
  value?: AstLocation;
  node: AstLocation;
  file: number;
}
