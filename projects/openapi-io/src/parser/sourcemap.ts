import fs from 'node:fs/promises';
import { createHash } from 'crypto';

import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { SerializedSourcemap } from '@useoptic/openapi-utilities';

export type JsonPath = string;
export type FileReference = number;

export type ToSource = [FileReference, JsonPath];

function getsha256(contents: string): string {
  const hash = createHash('sha256');

  hash.update(contents);

  return hash.digest('hex');
}

export class JsonSchemaSourcemap {
  static fromSerializedSourcemap(
    serialized: SerializedSourcemap
  ): JsonSchemaSourcemap {
    const sourcemap = new JsonSchemaSourcemap(serialized.rootFilePath);
    sourcemap.files = serialized.files;
    sourcemap.refMappings = serialized.refMappings;
    return sourcemap;
  }

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
        sha256: getsha256(contents),
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
        sha256: getsha256(contents),
      });
    }
  }

  logPointerInFile(
    filePath: string,
    sourcePointer: string,
    targetPointer: string
  ) {
    const thisFile = this.files.find((i) => filePath === i.path);

    if (thisFile) {
      this.refMappings[targetPointer] = [thisFile.index, sourcePointer];
    }
  }

  logPointer(pathRelativeToFile: string, pathRelativeToRoot: string) {
    const relativePathDecoded =
      jsonPointerHelpers.unescapeUriSafePointer(pathRelativeToFile);
    const rootKey = jsonPointerHelpers.unescapeUriSafePointer(
      pathRelativeToRoot.substring(1)
    );

    const thisFile = this.files.find((i) =>
      relativePathDecoded.startsWith(i.path)
    );

    if (thisFile) {
      const jsonPointer = jsonPointerHelpers.unescapeUriSafePointer(
        relativePathDecoded.split(thisFile.path)[1].substring(1) || '/'
      );

      if (rootKey === jsonPointer) return;

      this.refMappings[rootKey] = [thisFile.index, jsonPointer];
    }
  }
}
