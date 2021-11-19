import { IFilePatch, IPatchOpenAPIReconciler } from '../types';
import { ISpecReader } from '../../read/types';
import {
  IPatchGroup,
  PatchesToSave,
} from '../incremental-json-patch/json-patcher';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import stringify from 'json-stable-stringify';

export function StringifyReconciler(
  reader: ISpecReader
): IPatchOpenAPIReconciler {
  return {
    patchesToFileMutations: async (
      patchesToSave: PatchesToSave<OpenAPIV3.Document>
    ): Promise<IFilePatch> => {
      // console.log(JSON.stringify(patchesToSave.document, null, 2));
      return {
        files: [
          {
            path: reader.rootFile(),
            newContents: stringify(patchesToSave.document, { space: 1 }),
          },
        ],
      };
    },
  };
}
