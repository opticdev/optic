import { ShapePatch } from '../patches';
import { OperationGroup, PatchImpact } from '../../../../../oas/specs/patches';
import {
  JsonSchemaKnownKeyword,
  ErrorObject,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../diff';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* enumKeywordDiffs(
  validationError: ErrorObject,
  example: any
): IterableIterator<ShapeDiffResult> {
  if (validationError.keyword !== JsonSchemaKnownKeyword.enum) return;
  const propertyPath = validationError.schemaPath.substring(1);
  const parts = jsonPointerHelpers.decode(propertyPath);
  const key = parts[parts.length - 2];
  const unmatchedEnumValue = jsonPointerHelpers.get(
    example,
    validationError.instancePath
  );
  yield {
    description: `'${key}' does not have enum value ${unmatchedEnumValue}`,
    kind: ShapeDiffResultKind.MissingEnumValue,
    keyword: JsonSchemaKnownKeyword.enum,
    value: unmatchedEnumValue,
    example,
    propertyPath,
    instancePath: validationError.instancePath,
    key,
  };
}

export function* enumPatches(
  diff: ShapeDiffResult
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
