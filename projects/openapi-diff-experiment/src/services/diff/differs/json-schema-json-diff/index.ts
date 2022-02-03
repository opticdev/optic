import {
  BodyLocation,
  FieldLocation,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { prepareSchemaForDiff } from './prepare-schema-for-diff';
import Ajv, { ErrorObject } from 'ajv';
import { JsonSchemaDiffPlugin } from './plugins/plugin-types';
// Register plugins here
import { requiredKeyword } from './plugins/required';
import { additionalProperties } from './plugins/additionalProperties';
import { JsonSchemaJsonDiffer } from './types';
import { typeKeyword } from './plugins/type';
import { oneOfKeyword } from './plugins/oneOf';
import { DiffType, ShapeDiffTypes } from '../../types';
import { normalizeJsonPointer } from '../../normalize-json-pointer';

export function jsonSchemaDiffer(
  plugins: JsonSchemaDiffPlugin<any>[]
): JsonSchemaJsonDiffer {
  const supportedKeywords = plugins.map((i) => i.keyword);

  const opticAjv = new Ajv({
    allErrors: true,
    validateFormats: false,
    strictSchema: false,
    useDefaults: true,
  });

  const pluginsMap: { [key: string]: JsonSchemaDiffPlugin<any> } = {};
  plugins.forEach((i) => {
    if (i.attachKeyword) i.attachKeyword(opticAjv);
    pluginsMap[i.keyword] = i;
  });

  const compare = (
    schema: OpenAPIV3.SchemaObject,
    to: any,
    location: BodyLocation,
    schemaPath: string,
    options: {
      collapseToFirstInstanceOfArrayDiffs: boolean;
    } = { collapseToFirstInstanceOfArrayDiffs: true }
  ): ShapeDiffTypes[] => {
    const validate = opticAjv.compile(prepareSchemaForDiff(schema));
    validate(to);

    const shapeDiffs = (validate.errors ? validate.errors : []).map(
      (validationDiff) => validationDiff
    );
    const cleaned = differ.stripKeywordsNotSupported(shapeDiffs);

    const allDiffs = cleaned.map((i) =>
      differ.ajvToDiff(schema, schemaPath, i, to, location)
    );

    if (options.collapseToFirstInstanceOfArrayDiffs) {
      return cleanArrayInstances(allDiffs);
    }

    return allDiffs;
  };

  const differ: JsonSchemaJsonDiffer = {
    compare,
    opticAjv,
    supportedKeywords,
    stripKeywordsNotSupported: (diffs: ErrorObject[]) =>
      diffs.filter((diff) => {
        if (supportedKeywords.includes(diff.keyword)) {
          return true;
        } else {
          console.log('ajv keyword not supported: ', diff.keyword);
          return false;
        }
      }),
    diffToPatch: (diff, patcher) => {
      if (pluginsMap[diff.keyword]) {
        return pluginsMap[diff.keyword].shapePatches(diff, differ, patcher);
      } else {
        throw new Error(
          'Patch could not be computed from Json Schema Diff issue of type: ' +
            diff.type
        );
      }
    },
    ajvToDiff: (
      schema: OpenAPIV3.SchemaObject,
      schemaPath: string,
      diff: ErrorObject,
      example: any,
      location: BodyLocation
    ) => {
      if (pluginsMap[diff.keyword]) {
        return pluginsMap[diff.keyword].emitDiff(
          schemaPath,
          diff,
          example,
          location
        );
      } else {
        throw new Error('Diff could not be computed from Ajv issue');
      }
    },
  };
  return differ;
}

export const opticJsonSchemaDiffer = () => {
  return jsonSchemaDiffer([
    requiredKeyword,
    additionalProperties,
    typeKeyword,
    oneOfKeyword,
  ]);
};

// clean paths
export function cleanArrayInstances(diffs: ShapeDiffTypes[]) {
  const distinctDiffs: ShapeDiffTypes[] = [];

  diffs.forEach((diff) => {
    switch (diff.type) {
      case DiffType.BodyUnmatchedType:
        if (
          !distinctDiffs.find(
            (i) =>
              i.type === DiffType.BodyUnmatchedType &&
              i.propertyPath === diff.propertyPath &&
              i.schemaPath === diff.schemaPath
          )
        ) {
          distinctDiffs.push(diff);
        }
        break;
      case DiffType.BodyAdditionalProperty:
        const normalized = normalizeJsonPointer(diff.propertyExamplePath);

        // store first unique, skip others
        if (
          !distinctDiffs.find(
            (i) =>
              i.type === DiffType.BodyAdditionalProperty &&
              normalizeJsonPointer(i.propertyExamplePath) === normalized
          )
        ) {
          distinctDiffs.push(diff);
        }

        break;
      case DiffType.BodyMissingRequiredProperty:
        distinctDiffs.push(diff);
        break;
      default:
        throw new Error(
          'must implement array diff de-duping for all diff types. no impl for ' +
            diff
        );
    }
  });

  return distinctDiffs;
}
