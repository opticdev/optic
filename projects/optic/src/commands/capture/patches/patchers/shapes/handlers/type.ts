import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../diff';
import { Schema, SchemaObject } from '../schema';
import { ShapeLocation } from '../documented-bodies';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { ShapePatch } from '../patches';
import { OperationGroup, PatchImpact } from '../../../../../oas/specs/patches';
import { CapturedInteraction } from '../../../../sources/captured-interactions';

export function* typeKeywordDiffs(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.type) return;
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

  yield {
    description: `'${keyName}' did not match schema`,
    expectedType: `${validationError.params.type}`,
    kind: ShapeDiffResultKind.UnmatchedType,
    keyword: JsonSchemaKnownKeyword.type,
    instancePath: validationError.instancePath,
    propertyPath: propertyPath,
    key: keyName,
    example: unmatchedValue,
  };
}
export function* typePatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  interaction: CapturedInteraction,
  shapeContext: { location?: ShapeLocation },
  openAPIVersion: SupportedOpenAPIVersions
): IterableIterator<ShapePatch> {
  if (
    diff.kind !== ShapeDiffResultKind.UnmatchedType ||
    diff.keyword !== JsonSchemaKnownKeyword.type
  )
    return;

  const currentPropertySchema = jsonPointerHelpers.get(
    schema,
    diff.propertyPath
  );
  const alreadyOneOf = Array.isArray(currentPropertySchema.oneOf);

  function makeOneOfOperations() {
    const groupedOperations: OperationGroup[] = [];
    if (alreadyOneOf) {
      let baseSchema = Schema.baseFromValue(diff.example, openAPIVersion);

      if (
        !currentPropertySchema.oneOf.find((branchSchema) =>
          Schema.equals(baseSchema, branchSchema)
        )
      ) {
        groupedOperations.push(
          OperationGroup.create(`add new oneOf type to ${diff.key}`, {
            op: 'add',
            path: jsonPointerHelpers.append(diff.propertyPath, 'oneOf', '-'), // "-" indicates append to array
            value: baseSchema,
          })
        );
      }
    } else {
      let mergeOperations = [
        ...Schema.mergeOperations(Schema.clone(currentPropertySchema), {
          oneOf: [
            Schema.clone(currentPropertySchema),
            Schema.baseFromValue(diff.example, openAPIVersion),
          ],
        }),
      ];

      groupedOperations.push(
        OperationGroup.create(
          `replace ${diff.key} with a one of containing both types`,
          ...mergeOperations.map((op) => ({
            ...op,
            path: jsonPointerHelpers.join(diff.propertyPath, op.path),
          }))
        )
      );
    }

    return groupedOperations;
  }

  function changeTypeOperations() {
    return [
      OperationGroup.create(`change ${diff.key} type`, {
        op: 'replace',
        path: jsonPointerHelpers.append(diff.propertyPath),
        // handles removal of keys that are no longer allowed
        value: Schema.merge(
          currentPropertySchema,
          Schema.baseFromValue(diff.example, openAPIVersion)
        ),
      }),
    ];
  }

  if (openAPIVersion === '3.0.x') {
    if (diff.example === null) {
      yield {
        description: `make ${diff.key} null`,
        diff,
        impact: [
          PatchImpact.Addition,
          !shapeContext.location
            ? PatchImpact.BackwardsCompatibilityUnknown
            : 'inRequest' in shapeContext.location
            ? PatchImpact.BackwardsCompatible
            : PatchImpact.BackwardsIncompatible,
        ],
        groupedOperations: [
          OperationGroup.create(`make ${diff.key} nullable`, {
            op: 'replace',
            path: jsonPointerHelpers.append(diff.propertyPath, 'nullable'),
            // handles removal of keys that are no longer allowed
            value: true,
          }),
        ],
        shouldRegeneratePatches: false,
        interaction,
      };
    } else {
      // option one: convert to a one-off
      yield {
        description: `make ${diff.key} oneOf`,
        diff,
        impact: [
          PatchImpact.Addition,
          !shapeContext.location
            ? PatchImpact.BackwardsCompatibilityUnknown
            : 'inRequest' in shapeContext.location
            ? PatchImpact.BackwardsCompatible
            : PatchImpact.BackwardsIncompatible,
        ],
        groupedOperations: makeOneOfOperations(),
        shouldRegeneratePatches: true,
        interaction,
      };

      // option two: change the type
      yield {
        diff,
        description: `change type of ${diff.key}`,
        impact: [PatchImpact.BackwardsIncompatible],
        groupedOperations: changeTypeOperations(),
        shouldRegeneratePatches: false,
        interaction,
      };
    }
  } else if (openAPIVersion === '3.1.x') {
    if (diff.example === null) {
      const schemaType = Array.isArray(schema.type)
        ? [...schema.type, 'null']
        : schema.type
        ? [schema.type, 'null']
        : ['null'];

      yield {
        description: `make ${diff.key} null`,
        diff,
        impact: [
          PatchImpact.Addition,
          !shapeContext.location
            ? PatchImpact.BackwardsCompatibilityUnknown
            : 'inRequest' in shapeContext.location
            ? PatchImpact.BackwardsCompatible
            : PatchImpact.BackwardsIncompatible,
        ],
        groupedOperations: [
          OperationGroup.create(`make ${diff.key} null`, {
            op: 'replace',
            path: jsonPointerHelpers.append(diff.propertyPath, 'type'),
            // handles removal of keys that are no longer allowed
            value: schemaType,
          }),
        ],
        shouldRegeneratePatches: false,
        interaction,
      };
    } else {
      yield {
        description: `make ${diff.key} oneOf`,
        diff,
        impact: [
          PatchImpact.Addition,
          !shapeContext.location
            ? PatchImpact.BackwardsCompatibilityUnknown
            : 'inRequest' in shapeContext.location
            ? PatchImpact.BackwardsCompatible
            : PatchImpact.BackwardsIncompatible,
        ],
        groupedOperations: makeOneOfOperations(),
        shouldRegeneratePatches: true,
        interaction,
      };

      // option two: change the type
      yield {
        diff,
        description: `change type of ${diff.key}`,
        impact: [PatchImpact.BackwardsIncompatible],
        groupedOperations: changeTypeOperations(),
        shouldRegeneratePatches: false,
        interaction,
      };
    }
  }
}
