import {
  JsonSchemaDiffPlugin,
  JsonSchemaKnownKeyword,
  JsonSchemaPatch,
  JsonSchemaPatchClassification,
} from './plugin-types';
import { ErrorObject } from 'ajv';
import {
  ConceptualLocation,
  FieldLocation,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { JsonSchemaJsonDiffer } from '../types';
import { BodyPropertyUnmatchedType, DiffType } from '../../../types';
import {
  JsonPatcher,
  jsonPatcher,
} from '../../../../patch/incremental-json-patch/json-patcher';
import { streamingJsonSchemaBuilder } from '../json-builder/streaming-json-schema-builder';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  allowedKeysForOneOf,
  cleanupNewSchema,
} from '../transition-assumptions';

export const typeKeyword: JsonSchemaDiffPlugin<BodyPropertyUnmatchedType> = {
  keyword: JsonSchemaKnownKeyword.type,
  emitDiff(
    schemaPath: string,
    validationError: ErrorObject,
    example: any,
    conceptualLocation: FieldLocation
  ): BodyPropertyUnmatchedType {
    const typeKeywordPath = jsonPointerHelpers.decode(
      validationError.schemaPath.substring(1)
    );

    const propertyPath = jsonPointerHelpers.pop(
      jsonPointerHelpers.compile(typeKeywordPath)
    );

    const keyName = jsonPointerHelpers.decode(propertyPath).pop() || '';

    const unmatchedValue = jsonPointerHelpers.get(
      example,
      validationError.instancePath
    );

    return {
      schemaPath,
      type: DiffType.BodyUnmatchedType,
      keyword: JsonSchemaKnownKeyword.type,
      location: conceptualLocation,
      propertyPath: propertyPath,
      key: keyName,
      example: unmatchedValue,
    };
  },
  shapePatches(
    diff: BodyPropertyUnmatchedType,
    differ: JsonSchemaJsonDiffer,
    patcher: JsonPatcher<OpenAPIV3.Document>
  ): JsonSchemaPatch[] {
    const schema = jsonPatcher(patcher.helper.get(diff.schemaPath));

    const makeOneOf = () => {
      const patch = schema.fork();
      const currentPropertySchema = jsonPointerHelpers.get(
        patch.currentDocument(),
        diff.propertyPath
      ) as OpenAPIV3.SchemaObject;

      const alreadyOneOf = Array.isArray(currentPropertySchema.oneOf);

      if (alreadyOneOf) {
        patch.apply(`add new oneOf type to ${diff.key}`, [
          {
            op: 'add',
            path: jsonPointerHelpers.append(diff.propertyPath, 'oneOf', '-'), // "-" indicates append to array
            value: streamingJsonSchemaBuilder(differ, diff.example),
          },
        ]);
      } else {
        patch.apply(`add ${diff.key} one of`, [
          {
            op: 'add',
            path: jsonPointerHelpers.append(diff.propertyPath, 'oneOf'),
            value: [
              currentPropertySchema,
              streamingJsonSchemaBuilder(differ, diff.example),
            ], // whatever it was before, with whatever it is now
          },
        ]);

        patch.helper.removeKeysNotAllowedAt(
          diff.propertyPath,
          allowedKeysForOneOf,
          'after changing to a oneOf'
        );
      }

      const effect = `make ${diff.key} oneOf`;
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

    const changeType = () => {
      const patch = schema.fork();
      const currentPropertySchema = jsonPointerHelpers.get(
        patch.currentDocument(),
        diff.propertyPath
      ) as OpenAPIV3.SchemaObject;

      patch.apply(`change ${diff.key} type`, [
        {
          op: 'replace',
          path: jsonPointerHelpers.append(diff.propertyPath),
          // handles removal of keys that are no longer allowed
          value: cleanupNewSchema(
            currentPropertySchema,
            streamingJsonSchemaBuilder(differ, diff.example)
          ),
        },
      ]);

      const effect = `change type of ${diff.key}`;
      return {
        classification: JsonSchemaPatchClassification.Incompatible, // changing a type in a request or response is breaking
        patch: patch.currentPatchesRelativeTo(diff.schemaPath),
        effect: effect,
        extends: false,
      };
    };

    return [makeOneOf(), changeType()];
  },
};
