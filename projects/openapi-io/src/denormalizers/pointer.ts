import { sourcemapReader } from '@useoptic/openapi-utilities';
import { JsonSchemaSourcemap } from '../parser/sourcemap';

function getFilePathFromPointer(sourcemap: JsonSchemaSourcemap, path: string) {
  const maybePath = sourcemapReader(sourcemap).findFile(path);

  return maybePath?.filePath ?? null;
}

export function logPointer(
  sourcemap: JsonSchemaSourcemap,
  pointers: { old: string; new: string }
) {
  const maybeFilePath = getFilePathFromPointer(sourcemap, pointers.old);

  if (maybeFilePath) {
    sourcemap.logPointerInFile(maybeFilePath, pointers.new, pointers.old);
  }
}
