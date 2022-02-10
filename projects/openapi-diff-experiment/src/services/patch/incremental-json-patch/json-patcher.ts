import jsonPatch, { Operation } from 'fast-json-patch';
import { copyObject } from '../../../utils/debug_waitFor';
import { isObject } from '../../../utils/is-object';
import niceTry from 'nice-try';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { isExtension } from '../../diff/differs/json-schema-json-diff/transition-assumptions';
import invariant from 'ts-invariant';

export interface JsonPatcher<G> {
  fork: () => JsonPatcher<G>;
  currentPatches: () => IPatchGroup[];
  currentPatchesRelativeTo: (basePointer: string) => IPatchGroup[];
  applyPatch: (patch: IPatchGroup) => void;
  helper: {
    getPath: (basePath: string, path: string[]) => any;
    get: (path: string) => any;
    removeKeysNotAllowedAt: (
      basePath: string,
      allowedKeys: string[],
      reason: string
    ) => void;
  };
  apply: (
    intent: string,
    patches: Operation[],
    swallowErrors?: boolean
  ) => {
    error?: string;
    patch?: { patches: Operation[]; intent: string };
    success: boolean;
  };
  reset: () => void;
  currentDocument: (log?: boolean) => G;
  patchesToSave: () => PatchesToSave<G>;
}

export function jsonPatcher<G>(
  original: G,
  initialPatches: IPatchGroup[] = []
): JsonPatcher<G> {
  let currentPatches: IPatchGroup[] = initialPatches;

  const currentDocument = (log: boolean = false) => {
    return currentPatches.reduce((original, patch) => {
      const newDoc = jsonPatch.applyPatch(
        copyObject(original),
        copyObject(patch.patches),
        true,
        false
      ).newDocument;
      if (log) {
        console.log(`apply patch: ${patch.intent}`);
        console.log(
          `with operations: ${JSON.stringify(patch.patches, null, 3)}`
        );
        console.log(`and result: ${JSON.stringify(newDoc, null, 3)}`);
      }
      return newDoc as G;
    }, copyObject(original) as G);
  };

  const apply = (
    intent: string,
    patches: Operation[],
    swallowErrors: boolean = false
  ) => {
    try {
      jsonPatch.applyPatch(
        copyObject(currentDocument()),
        copyObject(patches),
        true,
        false
      );
      const patch = { intent, patches };
      currentPatches.push(patch);
      return { success: true, patch };
    } catch (e: any) {
      if (swallowErrors) return { success: false, error: e.message };
      invariant(false, 'could not apply json patch ' + e.message);
    }
  };

  return {
    fork: () => {
      return jsonPatcher(original, [
        ...(copyObject(currentPatches) as IPatchGroup[]),
      ]);
    },
    currentPatches: () => {
      return currentPatches;
    },
    currentPatchesRelativeTo: (basePointer: string) => {
      const allPatches: IPatchGroup[] = copyObject(currentPatches || []);
      return allPatches.map((p) => {
        const { patches } = p;
        const updatedPatches = patches.map((operation) => {
          return {
            ...operation,
            path: jsonPointerHelpers.append(
              basePointer,
              ...jsonPointerHelpers.decode(operation.path)
            ),
          };
        });
        return { ...p, patches: updatedPatches };
      });
    },
    currentDocument,
    patchesToSave: (): PatchesToSave<G> => {
      return { patches: currentPatches, document: currentDocument() };
    },
    apply,
    applyPatch: (patch: IPatchGroup) => {
      apply(patch.intent, patch.patches);
    },
    reset: () => {
      currentPatches = [];
    },
    helper: {
      get: (path: string) => {
        return niceTry(() =>
          jsonPatch.getValueByPointer(currentDocument(), path)
        );
      },
      removeKeysNotAllowedAt: (
        basePath: string,
        allowedKeys: string[],
        reason: string
      ) => {
        const current = currentDocument();
        const parent = niceTry(() =>
          jsonPatch.getValueByPointer(current, basePath)
        );

        if (parent && isObject(parent)) {
          Object.keys(parent).forEach((key) => {
            if (!allowedKeys.includes(key) || isExtension(key)) {
              const keypath = jsonPointerHelpers.append(basePath, key);
              apply(`remove ${key} after ${reason}`, [
                {
                  op: 'remove',
                  path: keypath,
                },
              ]);
            }
          });
        }
      },
      getPath: (basePath: string, paths: string[]) => {
        const myPath = jsonPointerHelpers.append(basePath, ...paths);
        return niceTry(() =>
          jsonPatch.getValueByPointer(currentDocument(), myPath)
        );
      },
    },
  };
}

export interface IPatchGroup {
  intent: string; // human readable
  patches: Operation[];
}

export type PatchesToSave<G> = { patches: IPatchGroup[]; document: G };
