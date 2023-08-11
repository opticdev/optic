import {
  JsonSchemaKnownKeyword,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../../diffs';
import { OperationGroup, PatchImpact, ShapePatch } from '..';
import { SchemaObject } from '../../schema';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { ShapeLocation } from '../..';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';

export function* enumPatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location?: ShapeLocation },
  openAPIVersion: SupportedOpenAPIVersions
): IterableIterator<ShapePatch> {
  if (
    diff.kind !== ShapeDiffResultKind.MissingEnumValue ||
    diff.keyword !== JsonSchemaKnownKeyword.enum
  )
    return;

  let groupedOperations: OperationGroup[] = [];

  groupedOperations.push(
    OperationGroup.create(`add new enum value to ${diff.key}`, {
      op: 'add',
      path: jsonPointerHelpers.append(diff.propertyPath, '-'), // "-" indicates append to array
      value: diff.value,
    })
  );
  yield {
    description: `add enum ${diff.value} to ${diff.key} `,
    diff,
    impact: [PatchImpact.Addition],
    groupedOperations,
    shouldRegeneratePatches: false,
  };
}
