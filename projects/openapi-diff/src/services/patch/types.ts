import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { ISpecReader } from '../read/types';
import {
  IPatchGroup,
  JsonPatcher,
  PatchesToSave,
} from './incremental-json-patch/json-patcher';
import { ApiTraffic } from '../traffic/types';
import { ShapeDiffTypes } from '../diff/types';
import { JsonSchemaPatch } from '../diff/differs/json-schema-json-diff/plugins/plugin-types';

/*
  Patching a specification has two steps
  - mutating the JSON-like object, by exposing domain-relevant helpers
  - updating the JSON-like objects across the file system to match w/ what we have in-memory via a reconcile pattern. Json-like * sourcemap
    essentially redraw the JSON across the file system with our changes
 */

/*
  During WIP Phase, we will not be reconciling the file system -- instead we will simple, be flushing via stringify methods.
  It's destructive, but not the part to optimize first
 */

export interface IPatchOpenAPI {
  reset: () => void;
  listPatches: () => IPatchGroup[];
  save: (options: { dryRun: boolean }) => void;
  forkedPatcher(): JsonPatcher<OpenAPIV3.Document>;
  init: {
    operation: (
      pathPattern: string,
      method: OpenAPIV3.HttpMethods,
      example: ApiTraffic
    ) => void;
    response: (
      pathPattern: string,
      method: OpenAPIV3.HttpMethods,
      example: ApiTraffic
    ) => void;
    responseBody: (
      pathPattern: string,
      method: OpenAPIV3.HttpMethods,
      statusCodeMatcher: string,
      contentType: string,
      example: ApiTraffic
    ) => void;
  };

  patch: {
    property: (jsonSchemaPatch: JsonSchemaPatch) => void;
  };
}

export interface IPatchOpenAPIReconciler {
  patchesToFileMutations(
    patchesToSave: PatchesToSave<OpenAPIV3.Document>
  ): Promise<IFilePatch>;
}

export type IPatchOpenAPIReconcilerFactory = (
  reader: ISpecReader
) => IPatchOpenAPIReconciler;

export type IFilePatch = { files: { path: string; newContents: string }[] };
