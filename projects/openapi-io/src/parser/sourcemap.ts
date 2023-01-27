import { YAMLMapping, YAMLNode, YAMLSequence } from 'yaml-ast-parser';
import * as fs from 'fs-extra';
// @ts-ignore
import sha256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';

import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

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

  // Used to log pointers to the same file where it's been reorganized
  logPointerToRootFile(newPointer: string, originalPointer: string) {
    const rootFile = this.files.find((file) => file.path === this.rootFilePath);

    if (rootFile) {
      this.refMappings[newPointer] = [rootFile.index, originalPointer];
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
