import { JsonSchemaSourcemap } from '../../parser/openapi-sourcemap-parser';
import jsonpatch, { Operation } from 'fast-json-patch';
import { groupPatchesWithSourcemap } from './group-patches-with-sourcemap';
import { StringifyPatchesAcrossFileSystem } from '../write-stringify/stringify-patches-across-file-system';
import { PatchApplyResult } from '../roundtrip-provider';

interface ReconcilableInput<T = object> {
  jsonLike: T;
  sourcemap: JsonSchemaSourcemap;
}

export function collectFilePatchesFromInMemoryUpdates<T>(
  input: ReconcilableInput<T>
) {
  const mutableJson = input.jsonLike;
  const observer = jsonpatch.observe<T>(mutableJson);

  return {
    updateInput: async (callback: (input: T) => void | Promise<void>) => {
      await callback(input.jsonLike);
    },
    toFilePatches: async (): Promise<PatchApplyResult[]> => {
      const patches = jsonpatch.generate(observer);
      const groupedPatches = groupPatchesWithSourcemap(
        input.sourcemap,
        patches
      );

      const patchesPromise = Object.entries(groupedPatches).map((patch) => {
        const [filePath, patches] = patch;
        return new StringifyPatchesAcrossFileSystem().applyPatches(
          filePath,
          patches
        );
      });

      return Promise.all(patchesPromise);
    },
  };
}
