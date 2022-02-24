import { JsonSchemaSourcemap, sourcemapReader } from '../../index';
import { Operation } from 'fast-json-patch';

import invariant from 'ts-invariant';
export type JsonPatchesByFile = { [key: string]: Operation[] };

export function groupPatchesWithSourcemap(
  sourcemap: JsonSchemaSourcemap,
  flatPatches: Operation[]
): JsonPatchesByFile {
  const readSourcemap = sourcemapReader(sourcemap);

  const filePatches: JsonPatchesByFile = {};

  flatPatches.forEach((patch) => {
    const result = readSourcemap.findFilePosition(patch.path);

    invariant(result, 'sourcemap lookup failed');

    const { filePath, startsAt } = result;
    if (filePatches.hasOwnProperty(filePath)) {
      filePatches[filePath] = [
        ...filePatches[filePath],
        { ...patch, path: startsAt },
      ];
    } else {
      filePatches[filePath] = [{ ...patch, path: startsAt }];
    }
  });

  return filePatches;
}
