import {
  JsonSchemaKnownKeyword,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../../diffs';
import { OperationGroup, PatchImpact, ShapePatch } from '..';
import { SchemaObject, Schema } from '../../schema';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { JsonPath } from '@useoptic/openapi-io';
import { ShapeLocation } from '../..';

export function* oneOfPatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location?: ShapeLocation }
): IterableIterator<ShapePatch> {
  if (
    diff.kind !== ShapeDiffResultKind.UnmatchedType ||
    diff.keyword !== JsonSchemaKnownKeyword.oneOf
  )
    return;

  let groupedOperations: OperationGroup[] = [];

  groupedOperations.push(
    OperationGroup.create(`add new oneOf branch to ${diff.key}`, {
      op: 'add',
      path: jsonPointerHelpers.append(diff.propertyPath, '-'), // "-" indicates append to array
      value: Schema.baseFromValue(diff.example),
    })
  );

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
  };
}
