import jsonPatch, { Operation } from 'fast-json-patch';
import { copyObject } from '../../../utils/debug_waitFor';
import { isObject } from '../../../utils/is-object';
import niceTry from 'nice-try';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export interface JsonPatcher<G> {
  fork: () => JsonPatcher<G>;
  currentPatches: () => IPatchGroup[];
  currentPatchesRelativeTo: (basePointer: string) => IPatchGroup[];
  applyPatch: (patch: IPatchGroup) => void;
  helper: {
    getPath: (basePath: string, path: string[]) => any;
    get: (path: string) => any;
    requiresObjectAt: (path: string[]) => void;
  };
  apply: (
    intent: string,
    patches: Operation[]
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

  const apply = (intent: string, patches: Operation[]) => {
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
      return { success: false, error: e.message };
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
      getPath: (basePath: string, paths: string[]) => {
        const myPath = jsonPointerHelpers.append(basePath, ...paths);
        return niceTry(() =>
          jsonPatch.getValueByPointer(currentDocument(), myPath)
        );
      },
      requiresObjectAt: (path: string[]) => {
        const intent = `require object: ${path}`;
        const wip = jsonPatcher(currentDocument());
        const found = niceTry(() =>
          jsonPatch.getValueByPointer(wip, jsonPointerHelpers.compile(path))
        );
        if (found) return;
        path.forEach((component, index) => {
          const partialPath = jsonPointerHelpers.compile(
            path.slice(0, index + 1)
          );
          const partialPathParent = jsonPointerHelpers.compile(
            path.slice(0, index)
          );
          const wipCurrent = wip.currentDocument();
          const valueAtPointer = niceTry(() =>
            jsonPatch.getValueByPointer(wipCurrent, partialPath)
          );

          const valueAtParentPointer = niceTry(() =>
            jsonPatch.getValueByPointer(wipCurrent, partialPathParent)
          );

          if (!valueAtPointer) {
            if (isObject(valueAtParentPointer)) {
              wip.apply(`add ${component}`, [
                { path: partialPath, value: {}, op: 'add' },
              ]);
            } else {
              throw new Error(`cannot ensure object at : ${path}`);
            }
          }
        });

        apply(
          intent,
          wip.currentPatches().flatMap((i) => i.patches)
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
