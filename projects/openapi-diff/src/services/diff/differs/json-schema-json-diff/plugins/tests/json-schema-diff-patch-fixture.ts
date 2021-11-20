import { JsonSchemaJsonDiffer } from '../../types';
import { ConceptualLocation, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPatcher } from '../../../../../patch/incremental-json-patch/json-patcher';

export function jsonSchemaDiffPatchFixture(
  jsonDiffer: JsonSchemaJsonDiffer,
  schema: OpenAPIV3.SchemaObject,
  input: any,
  location: ConceptualLocation
) {
  const patcher = jsonPatcher(schema);

  // hardcode root schema path for tests
  const schemaPath = '';

  const diffs = jsonDiffer.compare(schema, input, location, schemaPath, {
    collapseToFirstInstanceOfArrayDiffs: true,
  });

  let totalDiffsAfterPatches = 0;

  const results = diffs.map((diff) => {
    const patches = jsonDiffer.diffToPatch(diff, patcher as any);

    return {
      diff,
      patchesExecuted: patches.map((patch) => {
        const jsonSchema = jsonPatcher(schema);
        patch.patch.forEach(jsonSchema.applyPatch);

        const newJsonSchema = jsonSchema.currentDocument();

        console.log(newJsonSchema);

        const newDiffs = jsonDiffer.compare(
          newJsonSchema,
          input,
          location,
          schemaPath,
          { collapseToFirstInstanceOfArrayDiffs: true }
        );
        totalDiffsAfterPatches = totalDiffsAfterPatches + newDiffs.length;

        return {
          patch,
          newJsonSchema,
          newDiffs,
        };
      }),
    };
  });

  return {
    ...results,
    totalDiffsAfterPatches,
  };
}

const inARequest: ConceptualLocation = {
  path: '/example',
  method: 'post',
  inRequest: {
    body: {
      contentType: 'application/json',
    },
  },
};

const inAResponse: ConceptualLocation = {
  path: '/example',
  method: 'post',
  inResponse: {
    statusCode: '200',
    body: {
      contentType: 'application/json',
    },
  },
};
export const locations = {
  inARequest,
  inAResponse,
};
