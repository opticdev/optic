import { IPatchOpenAPI, IPatchOpenAPIReconciler } from './types';
import { ISpecReader } from '../read/types';
import flatten from 'lodash.flatten';
import {
  IPatchGroup,
  JsonPatcher,
  jsonPatcher,
} from './incremental-json-patch/json-patcher';
import { ApiTraffic } from '../traffic/types';
import { addNewOperation } from '../diff/differs/operations/new-operation';
import { opticJsonSchemaDiffer } from '../diff/differs/json-schema-json-diff';
import { addResponseForExample } from '../diff/differs/responses/new-response';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { patchAdditionalQueryParameter } from '../diff/differs/query-parameters/new-query-parameters';

export async function createOpenApiPatch(
  reader: ISpecReader,
  reconciler: IPatchOpenAPIReconciler
): Promise<IPatchOpenAPI> {
  // safe to await because this shouldn't be instantiated unless reader.didLoad() runs
  const spec = await reader.flattenedSpecification();
  const patcher = jsonPatcher(spec);
  const jsonSchemaJsonDiffer = opticJsonSchemaDiffer();

  return {
    listPatches(): IPatchGroup[] {
      return patcher.currentPatches();
    },
    save: async (options: { dryRun: boolean }) => {
      const filePatches = await reconciler.patchesToFileMutations(
        patcher.patchesToSave()
      );
      await reader.save(filePatches);
    },
    reset(): void {
      patcher.reset();
    },
    forkedPatcher(): JsonPatcher<OpenAPIV3.Document> {
      return patcher.fork();
    },
    patch: {
      property: (jsonSchemaPatch) => {
        const flatOperations = flatten(
          jsonSchemaPatch.patch.map((i) => i.patches)
        );
        patcher.applyPatch({
          intent: jsonSchemaPatch.effect,
          patches: flatOperations,
        });
      },
    },
    init: {
      response: (
        pathPattern: string,
        method: OpenAPIV3.HttpMethods,
        example: ApiTraffic
      ) => {
        const responsesMapPointer = jsonPointerHelpers.compile([
          'paths',
          pathPattern,
          method,
          'responses',
        ]);
        addResponseForExample(
          patcher,
          responsesMapPointer,
          example,
          jsonSchemaJsonDiffer
        );
      },
      queryParameter: (method, path, name, exampleValue) => {
        patchAdditionalQueryParameter(
          patcher,
          method,
          path,
          name,
          exampleValue
        );
      },
      responseBody: (
        pathPattern: string,
        method: OpenAPIV3.HttpMethods,
        statusCodeMatcher: string,
        contentType: string,
        example: ApiTraffic
      ) => {},
      operation: (
        pathPattern: string,
        method: OpenAPIV3.HttpMethods,
        example: ApiTraffic
      ) => {
        addNewOperation(
          patcher,
          pathPattern,
          method,
          example,
          jsonSchemaJsonDiffer
        );
      },
    },
  };
}
