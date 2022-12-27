import { ShapeDiffResult, ShapeDiffResultKind } from '../../diffs';
import { OperationGroup, PatchImpact, ShapePatch } from '..';
import { SchemaObject } from '../../schema';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { JsonPath } from '@useoptic/openapi-io';
import { ShapeLocation } from '../..';

export function* requiredPatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location?: ShapeLocation }
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

  function* removePropertyOperations(parentObjectPath: JsonPath, key: string) {
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
  };
}
