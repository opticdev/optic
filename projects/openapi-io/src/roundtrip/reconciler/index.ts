import { JsonSchemaSourcemap } from '../../parser/sourcemap';
import jsonpatch from 'fast-json-patch';
import { groupPatchesWithSourcemap } from './group-patches-with-sourcemap';
import { StringifyPatchesAcrossFileSystem } from '../write-stringify/stringify-patches-across-file-system';
import { PatchApplyResult } from '../roundtrip-provider';
import { loadYaml } from '../../index';
import invariant from 'ts-invariant';
import fs from 'fs-extra';

interface ReconcilableInput<T = object> {
  jsonLike: T;
  sourcemap: JsonSchemaSourcemap;
}

export type SpecFile = { contents: string; value: any };
export type SpecFiles = {
  root: SpecFile;
  files: { [key: string]: SpecFile };
};

export function collectFilePatchesFromInMemoryUpdates<T>(
  input: ReconcilableInput<T>
) {
  const mutableJson = input.jsonLike;
  const observer = jsonpatch.observe<T>(mutableJson);
  let flushed = false;

  const deps: { [key: string]: { contents: string; value: any } } = {};
  input.sourcemap.files.forEach((i) => {
    deps[i.path] = {
      contents: i.contents,
      value: loadYaml(i.contents),
    };
  });

  const files: SpecFiles = {
    files: deps,
    root: deps[input.sourcemap.rootFilePath],
  };

  const patcher = {
    update: async (
      callback: (input: T, deps: SpecFiles) => void | Promise<void>
    ) => {
      await callback(input.jsonLike, files);
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
          input.sourcemap.files.find((i) => i.path === filePath)!.contents,
          patches
        );
      });

      return Promise.all(patchesPromise);
    },
    flush: async () => {
      invariant(
        !flushed,
        'already flushed OpenAPI changes. You can only call this once'
      );

      flushed = true;

      const patches = await patcher.toFilePatches();

      invariant(
        patches.every((i) => i.success),
        'some patches could not be applied.'
      );

      return Promise.all(
        patches.map((patch) => {
          if (patch.success) {
            console.log(`writing patch to ${patch.filePath}`);
            return fs.writeFile(patch.filePath, patch.asString);
          }
        })
      );
    },
  };

  return patcher;
}
