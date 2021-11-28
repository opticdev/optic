import {
  JsonSchemaDiffPlugin,
  JsonSchemaKnownKeyword,
  JsonSchemaPatch,
  JsonSchemaPatchClassification,
} from './plugin-types';
import { ErrorObject } from 'ajv';
import { BodyMissingRequiredProperty, DiffType } from '../../../types';
import {
  BodyLocation,
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
      conceptualLocation: BodyLocation
    ): BodyMissingRequiredProperty {
      const parentObjectPath = jsonPointerHelpers.pop(
        validationError.schemaPath.substring(1)
      );
      const key = validationError.params.missingProperty;
      return {
        schemaPath,
        instancePath: jsonPointerHelpers.append(
          validationError.instancePath,
          validationError.params.missingProperty
        ),
        propertyPath: jsonPointerHelpers.append(parentObjectPath, key),
        type: DiffType.BodyMissingRequiredProperty,
        keyword: JsonSchemaKnownKeyword.required,
        location: {
          ...conceptualLocation,
          jsonSchemaTrail: jsonPointerHelpers.decode(
            validationError.instancePath
          ),
        },
        parentObjectPath,
        key,
      };
    },
    shapePatches(
      diff: BodyMissingRequiredProperty,
      differ: JsonSchemaJsonDiffer,
      patcher: JsonPatcher<OpenAPIV3.Document>
    ): JsonSchemaPatch[] {
      const makeOptional = (): JsonSchemaPatch => {
        const schema = jsonPatcher(patcher.helper.get(diff.schemaPath));

        const patch = schema.fork();

        const requiredPath = jsonPointerHelpers.append(
          diff.parentObjectPath,
          'required'
        );

        const requiredArray = jsonPointerHelpers.get(
          patch.currentDocument(),
          requiredPath
        ) as string[];

        const indexOfRequired = requiredArray.indexOf(diff.key);

        if (indexOfRequired !== -1) {
          patch.apply(`remove ${diff.key} from parent's required array`, [
            {
              op: 'remove',
              path: jsonPointerHelpers.append(
                requiredPath,
                indexOfRequired.toString()
              ),
            },
          ]);
        }

        const effect = `make property ${diff.key} optional`;
        return {
          classification:
            'inRequest' in diff.location
              ? JsonSchemaPatchClassification.Compatible
              : JsonSchemaPatchClassification.Incompatible,
          patch: patch.currentPatchesRelativeTo(diff.schemaPath),
          effect: effect,
          extends: true,
        };
      };

      const removeField = (): JsonSchemaPatch => {
        const schema = jsonPatcher(patcher.helper.get(diff.schemaPath));

        const patch = schema.fork();

        const requiredPath = jsonPointerHelpers.append(
          diff.parentObjectPath,
          'required'
        );

        // first make sure we remove it form the required array (dup above)
        const requiredArray = jsonPointerHelpers.get(
          patch.currentDocument(),
          requiredPath
        ) as string[];

        const indexOfRequired = requiredArray.indexOf(diff.key);

        if (indexOfRequired !== -1) {
          patch.apply(`remove ${diff.key} from parent's required array`, [
            {
              op: 'remove',
              path: jsonPointerHelpers.append(
                requiredPath,
                indexOfRequired.toString()
              ),
            },
          ]);
        }

        // now we need to remove it from the properties object
        const propertyPath = jsonPointerHelpers.append(
          diff.parentObjectPath,
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
          classification:
            'inRequest' in diff.location
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
