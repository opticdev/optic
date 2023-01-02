import { ShapeDiffResult, ShapeDiffResultKind } from '../../diffs';
import { OperationGroup, PatchImpact, ShapePatch } from '..';
import { SchemaObject } from '../../schema';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Schema } from '../../schema';
import { ShapeLocation } from '../..';

export function* additionalPropertiesPatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location?: ShapeLocation }
): IterableIterator<ShapePatch> {
  if (diff.kind !== ShapeDiffResultKind.AdditionalProperty) return;

  const parentPath = jsonPointerHelpers.pop(diff.parentObjectPath);

  const parentOption = jsonPointerHelpers.tryGet(schema, parentPath);

  if (!parentOption.match) return;

  const parent = parentOption.value;

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
  // if required is not set, create one with property in it
  if (!parent.required) {
    groupedOperations.push(
      OperationGroup.create(
        `add required [] to parent object and make ${diff.key} required`,
        {
          op: 'add',
          path: requiredPath,
          value: [diff.key],
          // @ts-ignore
          extra: 'same',
        }
      )
    );
  } else if (!parent.required.includes(diff.key)) {
    groupedOperations.push(
      OperationGroup.create(`make new property ${diff.key} required`, {
        op: 'add',
        path: requiredPath + '/-', // append
        value: diff.key,
      })
    );
  }

  // ok now we're ready for the property
  if (!(parent.properties || {}).hasOwnProperty(diff.key)) {
    groupedOperations.push(
      OperationGroup.create(
        `add property ${diff.key} schema to properties`,

        {
          op: 'add',
          path: newPropertyPath,
          value: Schema.baseFromValue(diff.example),
        }
      )
    );
  }

  if (groupedOperations.length < 1) return;

  yield {
    description: `add property ${diff.key}`,
    diff,
    impact: [
      PatchImpact.Addition,
      !shapeContext.location
        ? PatchImpact.BackwardsCompatibilityUnknown
        : 'inResponse' in shapeContext.location
        ? PatchImpact.BackwardsCompatible
        : PatchImpact.BackwardsIncompatible,
    ],
    groupedOperations,
  };
}
