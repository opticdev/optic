import { ShapeDiffResult, ShapeDiffResultKind } from '../../diffs';
import { OperationGroup, PatchImpact, ShapePatch } from '..';
import { SchemaObject } from '../../body';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Schema } from '../../schema';
import { BodyLocation } from '@useoptic/openapi-utilities';

export function* requiredShapePatch(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location: BodyLocation }
): IterableIterator<ShapePatch> {
  if (diff.kind !== ShapeDiffResultKind.AdditionalProperty) return;

  const parentPath = jsonPointerHelpers.pop(diff.parentObjectPath);

  const parent = jsonPointerHelpers.get(schema, parentPath);
  const propertiesPath = jsonPointerHelpers.append(parentPath, 'properties');
  const requiredPath = jsonPointerHelpers.append(parentPath, 'required');
  const newPropertyPath = jsonPointerHelpers.append(
    parentPath,
    'properties',
    diff.key
  );

  // if properties is not set, create one with empty {}
  let groupedOperations: OperationGroup[] = [];
  if (!parent.properties) {
    groupedOperations.push(
      OperationGroup.create(`add properties {} to parent object`, {
        op: 'add',
        path: propertiesPath,
        value: {},
      })
    );
  }
  // if required is not set, create one with empty []
  if (!parent.required) {
    groupedOperations.push(
      OperationGroup.create(`add required [] to parent object`, {
        op: 'add',
        path: requiredPath,
        value: [],
        // @ts-ignore
        extra: 'same',
      })
    );
  }

  // ok now we're ready for the property
  if (!(parent.properties || {}).hasOwnProperty(diff.key)) {
    groupedOperations.push(
      OperationGroup.create(`add property ${diff.key} schema to properties`, {
        op: 'add',
        path: newPropertyPath,
        value: Schema.fromShapeDiff(diff),
      })
    );
  }

  if (!(parent.required || []).includes(diff.key)) {
    groupedOperations.push(
      OperationGroup.create(`make new property ${diff.key} required`, {
        op: 'add',
        path: requiredPath + '/-', // append
        value: diff.key,
      })
    );
  }

  yield {
    description: `add property ${diff.key}`,
    impact: [
      PatchImpact.Addition,
      'inResponse' in shapeContext.location
        ? PatchImpact.BackwardsCompatible
        : PatchImpact.BackwardsIncompatible,
    ],
    groupedOperations,
  };
}
