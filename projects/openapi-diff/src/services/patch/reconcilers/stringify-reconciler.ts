import { IFilePatch, IPatchOpenAPIReconciler } from '../types';
import { ISpecReader } from '../../read/types';
import {
  jsonPatcher,
  PatchesToSave,
} from '../incremental-json-patch/json-patcher';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import {
  groupPatchesWithSourcemap,
  JsonPatchesByFile,
} from './group-patches-with-sourcemap';
import {
  sourcemapReader,
  isJson,
  isYaml,
  loadYaml,
  writeYaml,
} from '@useoptic/openapi-io';
import { Operation } from 'fast-json-patch';
import fs from 'fs-extra';

export function StringifyReconciler(
  reader: ISpecReader
): IPatchOpenAPIReconciler {
  return {
    patchesToFileMutations: async (
      patchesToSave: PatchesToSave<OpenAPIV3.Document>
    ): Promise<IFilePatch> => {
      const sourcemap = await reader.sourcemap();
      const flatPatches = patchesToSave.patches.flatMap((i) => i.patches);

      const grouped: JsonPatchesByFile = groupPatchesWithSourcemap(
        sourcemap,
        flatPatches
      );

      const files = Object.entries(grouped).map(async (entry) => {
        const [filePath, operations]: [string, Operation[]] = entry;

        const contentsOfFile = sourcemap.files.find(
          (i) => i.path === filePath
        ).contents;
        const currentDocument = await readCurrentDocument(
          filePath,
          contentsOfFile
        );
        const patch = jsonPatcher(currentDocument);

        patch.apply('patches', operations);
        return {
          path: filePath,
          previousContents: contentsOfFile,
          newContents: stringifyDocument(filePath, patch.currentDocument()),
        };
      });

      return {
        files: await Promise.all(files),
      };
    },
  };
}

function stringifyDocument(
  filePath: string,
  document: OpenAPIV3.Document
): string {
  if (isJson(filePath)) {
    return JSON.stringify(document, null, 2);
  } else if (isYaml(filePath)) {
    return writeYaml(document);
  } else {
    throw new Error(
      `${filePath} is not .json or .yaml file. Unsure how to serialize`
    );
  }
}

async function readCurrentDocument(
  filePath: string,
  fileContents: string
): Promise<any> {
  if (isJson(filePath)) {
    return JSON.parse(fileContents);
  } else if (isYaml(filePath)) {
    return loadYaml(fileContents);
  } else {
    throw new Error(
      `${filePath} is not .json or .yaml file. Unsure how to parse and apply patches`
    );
  }
}
