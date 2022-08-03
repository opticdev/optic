import { JsonSchemaSourcemap } from '@useoptic/openapi-io';
import { sourcemapReader } from '@useoptic/openapi-utilities';
import { Operation } from 'fast-json-patch';

export type JsonPatchesByFile = { [key: string]: Operation[] };

export function groupPatchesWithSourcemap(
  sourcemap: JsonSchemaSourcemap,
  flatPatches: Operation[]
): JsonPatchesByFile {
  const readSourcemap = sourcemapReader(sourcemap);

  const filePatches: JsonPatchesByFile = {};

  flatPatches.forEach((patch) => {
    const { filePath, startsAt } = readSourcemap.findFilePosition(patch.path);
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
