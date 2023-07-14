import fs from 'node:fs/promises';
import {
  SerializedSourcemap,
  sourcemapReader,
} from '@useoptic/openapi-utilities';
import { isYaml, loadYaml, writeYaml } from '@useoptic/openapi-io';
import jsonpatch, { Operation } from 'fast-json-patch';

export async function writePatchesToFiles(
  jsonPatches: Operation[],
  sourcemap: SerializedSourcemap
) {
  const sourcemapQueries = sourcemapReader(sourcemap);
  const operationsByFile: { [key: string]: Operation[] } = {};

  for (const patch of jsonPatches) {
    const result = sourcemapQueries.findFilePosition(patch.path);
    const { filePath, startsAt } = result;
    const adjustedPatch = { ...patch, path: startsAt };

    if (!operationsByFile[filePath]) operationsByFile[filePath] = [];

    operationsByFile[filePath].push(adjustedPatch);
  }

  // Then apply the patches and write files to disk
  for (let [filePath, operations] of Object.entries(operationsByFile)) {
    const file = sourcemap.files.find(({ path }) => path === filePath)!;

    const parsed = parse(filePath, file.contents);
    const patchedContents = jsonpatch.applyPatch(
      parsed.val || {},
      operations
    ).newDocument;
    const stringified = stringify(filePath, patchedContents);

    await fs.writeFile(filePath, stringified);
  }
}

function parse(filePath: string, fileContents: string) {
  if (isYaml(filePath)) {
    return loadYaml(fileContents);
  } else {
    return fileContents ? JSON.parse(fileContents) : {};
  }
}

function stringify(filePath: string, document: any) {
  if (isYaml(filePath)) {
    return writeYaml(document);
  } else {
    return JSON.stringify(document, null, 2);
  }
}
