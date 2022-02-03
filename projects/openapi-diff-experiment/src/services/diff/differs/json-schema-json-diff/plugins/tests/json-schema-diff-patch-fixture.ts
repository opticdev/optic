import { JsonSchemaJsonDiffer } from '../../types';
import {
  ConceptualLocation,
  FieldLocation,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { jsonPatcher } from '../../../../../patch/incremental-json-patch/json-patcher';
import { filterDiffsForBaseline } from '../../json-builder/filter-diffs-for-baseline';

export function jsonSchemaDiffPatchFixture(
  jsonDiffer: JsonSchemaJsonDiffer,
  schema: OpenAPIV3.SchemaObject,
  input: any,
  location: FieldLocation
) {
  const patcher = jsonPatcher(schema);

  // hardcode root schema path for tests
  const schemaPath = '';

  const allDiffs = jsonDiffer.compare(schema, input, location, schemaPath, {
    collapseToFirstInstanceOfArrayDiffs: true,
  });

  const diffs = filterDiffsForBaseline(schema, allDiffs, input);

  let totalDiffsAfterPatches = 0;

  const results = diffs.map((diff) => {
    const patches = jsonDiffer.diffToPatch(diff, patcher as any);

    return {
      diff,
      patchesExecuted: patches.map((patch) => {
        const jsonSchema = jsonPatcher(schema);
        patch.patch.forEach(jsonSchema.applyPatch);

        const newJsonSchema = jsonSchema.currentDocument();

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

const inARequest: FieldLocation = {
  path: '/example',
  method: 'post',
  inRequest: {
    body: {
      contentType: 'application/json',
    },
  },
  jsonSchemaTrail: [],
};

const inAResponse: FieldLocation = {
  path: '/example',
  method: 'post',
  inResponse: {
    statusCode: '200',
    body: {
      contentType: 'application/json',
    },
  },
  jsonSchemaTrail: [],
};
export const locations = {
  inARequest,
  inAResponse,
};
