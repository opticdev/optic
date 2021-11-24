import {
  JsonSchemaDiffPlugin,
  JsonSchemaKnownKeyword,
  JsonSchemaPatch,
  JsonSchemaPatchClassification,
} from './plugin-types';
import { ErrorObject } from 'ajv';
import { BodyMissingRequiredProperty, DiffType } from '../../../types';
import {
  ConceptualLocation,
  FieldLocation,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import {
  JsonPatcher,
  jsonPatcher,
} from '../../../../patch/incremental-json-patch/json-patcher';
import { JsonSchemaJsonDiffer } from '../types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export const requiredKeyword: JsonSchemaDiffPlugin<BodyMissingRequiredProperty> =
  {
    keyword: JsonSchemaKnownKeyword.required,
    emitDiff(
      schemaPath: string,
      validationError: ErrorObject,
      example: any,
      conceptualLocation: FieldLocation
    ): BodyMissingRequiredProperty {
      return {
        schemaPath,
        type: DiffType.BodyMissingRequiredProperty,
        keyword: JsonSchemaKnownKeyword.required,
        location: conceptualLocation,
        parentObjectPath: validationError.schemaPath.substring(1),
        key: validationError.params.missingProperty,
      };
    },
    shapePatches(
      diff: BodyMissingRequiredProperty,
      differ: JsonSchemaJsonDiffer,
      patcher: JsonPatcher<OpenAPIV3.Document>
    ): JsonSchemaPatch[] {
      const schema = jsonPatcher(patcher.helper.get(diff.schemaPath));

      const makeOptional = (): JsonSchemaPatch => {
        const patch = schema.fork();

        const requiredArray = jsonPointerHelpers.get(
          patch.currentDocument(),
          diff.parentObjectPath
        ) as string[];

        const indexOfRequired = requiredArray.indexOf(diff.key);

        patch.apply(`remove ${diff.key} from parent's required array`, [
          {
            op: 'remove',
            path: jsonPointerHelpers.append(
              diff.parentObjectPath,
              indexOfRequired.toString()
            ),
          },
        ]);

        const effect = `make property ${diff.key} optional`;
        return {
          classification: diff.location.hasOwnProperty('inRequest')
            ? JsonSchemaPatchClassification.Compatible
            : JsonSchemaPatchClassification.Incompatible,
          patch: patch.currentPatchesRelativeTo(diff.schemaPath),
          effect: effect,
          extends: true,
        };
      };

      const removeField = (): JsonSchemaPatch => {
        const patch = schema.fork();

        // first make sure we remove it form the required array (dup above)
        makeOptional().patch.forEach(patch.applyPatch);

        // now we need to remove it from the properties object
        const parentPath = jsonPointerHelpers.pop(diff.parentObjectPath);
        const propertyPath = jsonPointerHelpers.append(
          parentPath,
          'properties',
          diff.key
        );

        patch.apply(`remove ${diff.key} from parent's properties object`, [
          {
            op: 'remove',
            path: propertyPath,
          },
        ]);

        const effect = `remove property ${diff.key}`;
        return {
          classification: diff.location.hasOwnProperty('inRequest')
            ? JsonSchemaPatchClassification.Compatible
            : JsonSchemaPatchClassification.Incompatible,
          patch: patch.currentPatchesRelativeTo(diff.schemaPath),
          effect: effect,
          extends: false,
        };
      };

      return [makeOptional(), removeField()];
    },
  };
