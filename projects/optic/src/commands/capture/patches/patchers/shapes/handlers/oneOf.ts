import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { Schema, SchemaObject } from '../schema';
import { ShapeLocation } from '../documented-bodies';
import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../diff';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { PatchImpact, PatchOperation } from '../../../patch-operations';
import { ShapePatch } from '../patches';
import { CapturedInteraction } from '../../../../sources/captured-interactions';

export function* oneOfKeywordDiffs(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.oneOf) return;
  if (
    validationError.params.passingSchemas &&
    validationError.params.passingSchemas.length > 0
  )
    return; // no diffs or patches for multiple matches yet
  const typeKeywordPath = jsonPointerHelpers.decode(
    validationError.schemaPath.substring(1)
  );

  const oneOfIndex = typeKeywordPath.lastIndexOf('oneOf');

  const propertyPath = jsonPointerHelpers.compile(
    typeKeywordPath.slice(0, oneOfIndex + 1)
  );
  const keyName = jsonPointerHelpers.decode(propertyPath).pop() || '';

  const unmatchedValue = jsonPointerHelpers.get(
    example,
    validationError.instancePath
  );

  yield {
    description: `'${keyName}' did not match schema`,
    expectedType: 'oneOf schema',
    kind: ShapeDiffResultKind.UnmatchedType,
    keyword: JsonSchemaKnownKeyword.oneOf,
    instancePath: validationError.instancePath,
    propertyPath: propertyPath,
    key: keyName,
    example: unmatchedValue,
  };
}

export function* oneOfPatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  interaction: CapturedInteraction,
  shapeContext: { location?: ShapeLocation },
  openAPIVersion: SupportedOpenAPIVersions
): IterableIterator<ShapePatch> {
  if (
    diff.kind !== ShapeDiffResultKind.UnmatchedType ||
    diff.keyword !== JsonSchemaKnownKeyword.oneOf ||
    // @ts-ignore
    (diff.keyword === JsonSchemaKnownKeyword.type && diff.example === null)
  )
    return;

  let groupedOperations: PatchOperation[] = [];

  groupedOperations.push({
    op: 'add',
    path: jsonPointerHelpers.append(diff.propertyPath, '-'), // "-" indicates append to array
    value: Schema.baseFromValue(diff.example, openAPIVersion),
  });

  // TODO: possibly clean up the newly generated schema, or perhaps try to not make that necessary

  yield {
    description: `expand one of for ${diff.key}`,
    diff,
    impact: [
      PatchImpact.Addition,
      !shapeContext.location
        ? PatchImpact.BackwardsCompatibilityUnknown
        : 'inRequest' in shapeContext.location
          ? PatchImpact.BackwardsCompatible
          : PatchImpact.BackwardsIncompatible,
    ],
    groupedOperations,
    shouldRegeneratePatches: false,
    interaction,
  };
}
