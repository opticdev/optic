import {
  JsonSchemaDiffPlugin,
  JsonSchemaKnownKeyword,
  JsonSchemaPatch,
  JsonSchemaPatchClassification,
} from './plugin-types';
import { ErrorObject } from 'ajv';
import { BodyAdditionalProperty, DiffType } from '../../../types';
import {
  BodyLocation,
  ConceptualLocation,
  FieldLocation,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

import {
  JsonPatcher,
  jsonPatcher,
} from '../../../../patch/incremental-json-patch/json-patcher';
import { JsonSchemaJsonDiffer } from '../types';
import { streamingJsonSchemaBuilder } from '../json-builder/streaming-json-schema-builder';

export const additionalProperties: JsonSchemaDiffPlugin<BodyAdditionalProperty> =
  {
    keyword: JsonSchemaKnownKeyword.additionalProperties,
    emitDiff(
      schemaPath: string,
      validationError: ErrorObject,
      example: any,
      conceptualLocation: BodyLocation
    ): BodyAdditionalProperty {
      const key = validationError.params.additionalProperty;

      const propertyExamplePath = jsonPointerHelpers.append(
        validationError.instancePath,
        key
      );

      const parentObjectPath = validationError.schemaPath.substring(1);
      const propertyPath = jsonPointerHelpers.append(parentObjectPath, key);

      return {
        schemaPath,
        propertyPath,
        type: DiffType.BodyAdditionalProperty,
        keyword: JsonSchemaKnownKeyword.additionalProperties,
        instancePath: jsonPointerHelpers.append(
          validationError.instancePath,
          key
        ),
        location: {
          ...conceptualLocation,
          jsonSchemaTrail: jsonPointerHelpers.decode(
            validationError.instancePath
          ),
        },
        parentObjectPath,
        propertyExamplePath,
        example,
        key,
      };
    },
    shapePatches(
      diff: BodyAdditionalProperty,
      differ: JsonSchemaJsonDiffer,
      patcher: JsonPatcher<OpenAPIV3.Document>
    ): JsonSchemaPatch[] {
      const schema = jsonPatcher(patcher.helper.get(diff.schemaPath));

      const addProperty = (): JsonSchemaPatch => {
        const patch = schema.fork();

        const parentPath = jsonPointerHelpers.pop(diff.parentObjectPath);
        const parent = jsonPointerHelpers.get(
          patch.currentDocument(),
          parentPath
        );
        const propertiesPath = jsonPointerHelpers.append(
          parentPath,
          'properties'
        );
        const requiredPath = jsonPointerHelpers.append(parentPath, 'required');
        const newPropertyPath = jsonPointerHelpers.append(
          parentPath,
          'properties',
          diff.key
        );

        // if properties is not set, create one with empty {}
        if (!parent.properties) {
          patch.apply(`add properties {} to parent object`, [
            {
              op: 'add',
              path: propertiesPath,
              value: {},
            },
          ]);
        }
        // if required is not set, create one with empty []
        if (!parent.required) {
          patch.apply(`add required [] to parent object`, [
            {
              op: 'add',
              path: requiredPath,
              value: [],
              // @ts-ignore
              extra: 'same',
            },
          ]);
        }

        // ok now we're ready for the property
        if (!(parent.properties || {}).hasOwnProperty(diff.key)) {
          patch.apply(`add property ${diff.key} schema to properties`, [
            {
              op: 'add',
              path: newPropertyPath,
              // build new root schema
              value: streamingJsonSchemaBuilder(
                differ,
                jsonPointerHelpers.get(diff.example, diff.propertyExamplePath)
              ),
            },
          ]);
        }

        if (!(parent.required || []).includes(diff.key)) {
          patch.apply(`make new property ${diff.key} required`, [
            {
              op: 'add',
              path: requiredPath + '/-', // append
              value: diff.key,
            },
          ]);
        }

        const effect = `add property ${diff.key}`;
        return {
          extends: true,
          classification:
            'inResponse' in diff.location
              ? JsonSchemaPatchClassification.Compatible
              : JsonSchemaPatchClassification.Incompatible,
          patch: patch.currentPatchesRelativeTo(diff.schemaPath),
          effect: effect,
        };
      };

      return [addProperty()];
    },
  };
