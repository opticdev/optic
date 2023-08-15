import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../diff';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OperationGroup, PatchImpact } from '../../../../../oas/specs/patches';
import { SchemaObject } from 'ajv';
import { ShapeLocation } from '../documented-bodies';
import { ShapePatch } from '../patches';
import { CapturedInteraction } from '../../../../sources/captured-interactions';

export function* requiredKeywordDiffs(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.required) return;
  const parentObjectPath = jsonPointerHelpers.pop(
    validationError.schemaPath.substring(1)
  );
  const key = validationError.params.missingProperty;
  yield {
    description: `required property '${validationError.params.missingProperty}' was missing`,
    instancePath: jsonPointerHelpers.append(
      validationError.instancePath,
      validationError.params.missingProperty
    ),
    propertyPath: jsonPointerHelpers.append(
      parentObjectPath,
      'properties',
      key
    ),
    kind: ShapeDiffResultKind.MissingRequiredProperty,
    keyword: JsonSchemaKnownKeyword.required,
    parentObjectPath,
    key,
    example: undefined,
  };
}

export function* requiredPatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  interaction: CapturedInteraction,
  shapeContext: { location?: ShapeLocation },
  openAPIVersion: SupportedOpenAPIVersions
): IterableIterator<ShapePatch> {
  if (diff.kind !== ShapeDiffResultKind.MissingRequiredProperty) return;

  const requiredPath = jsonPointerHelpers.append(
    diff.parentObjectPath,
    'required'
  );

  const requiredArray = jsonPointerHelpers.get(
    schema,
    requiredPath
  ) as string[];

  function* makeOptionalOperations(indexOfRequired) {
    if (indexOfRequired > -1)
      yield OperationGroup.create(
        `remove ${diff.key} from parent's required array`,
        {
          op: 'remove',
          path: jsonPointerHelpers.append(
            requiredPath,
            indexOfRequired.toString()
          ),
        }
      );
  }

  function* removePropertyOperations(parentObjectPath: string, key: string) {
    const propertyPath = jsonPointerHelpers.append(
      parentObjectPath,
      'properties',
      key
    );

    yield OperationGroup.create(
      `remove ${key} from parent's properties object`,
      {
        op: 'remove',
        path: propertyPath,
      }
    );
  }
  // patch one: make required field optional
  let makeOptionalPatch = {
    impact: [
      PatchImpact.Addition,
      !shapeContext.location
        ? PatchImpact.BackwardsCompatibilityUnknown
        : 'inRequest' in shapeContext.location
        ? PatchImpact.BackwardsCompatible
        : PatchImpact.BackwardsIncompatible,
    ],
    diff,
    description: `make property ${diff.key} optional`,
    groupedOperations: [
      ...makeOptionalOperations(requiredArray.indexOf(diff.key)),
    ],
    interaction,
    shouldRegeneratePatches: false,
  };
  if (makeOptionalPatch.groupedOperations.length > 0) {
    yield makeOptionalPatch;
  }

  // patch two: remove property
  yield {
    description: `remove property ${diff.key}`,
    diff,
    impact: [
      !shapeContext.location
        ? PatchImpact.BackwardsCompatibilityUnknown
        : 'inRequest' in shapeContext.location
        ? PatchImpact.BackwardsCompatible
        : PatchImpact.BackwardsIncompatible,
    ],
    groupedOperations: [
      ...makeOptionalOperations(requiredArray.indexOf(diff.key)),
      ...removePropertyOperations(diff.parentObjectPath, diff.key),
    ],
    shouldRegeneratePatches: false,
    interaction,
  };
}
