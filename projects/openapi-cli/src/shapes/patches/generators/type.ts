import {
  JsonSchemaKnownKeyword,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../../diffs';
import { OperationGroup, PatchImpact, ShapePatch } from '..';
import { SchemaObject } from '../../body';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Schema } from '../../schema';
import { ShapeLocation } from '../..';

export function* typePatches(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location: ShapeLocation }
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
      groupedOperations.push(
        OperationGroup.create(`add new oneOf type to ${diff.key}`, {
          op: 'add',
          path: jsonPointerHelpers.append(diff.propertyPath, 'oneOf', '-'), // "-" indicates append to array
          value: Schema.fromValue(diff.example),
        })
      );
    } else {
      let mergeOperations = [
        ...Schema.mergeOperations(Schema.clone(currentPropertySchema), {
          oneOf: [
            Schema.clone(currentPropertySchema),
            Schema.fromValue(diff.example),
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
          Schema.fromValue(diff.example)
        ),
      }),
    ];
  }

  // option one: convert to a one-off
  yield {
    description: `make ${diff.key} oneOf`,
    impact: [
      PatchImpact.Addition,
      'inRequest' in shapeContext.location
        ? PatchImpact.BackwardsCompatible
        : PatchImpact.BackwardsIncompatible,
    ],
    groupedOperations: makeOneOfOperations(),
  };

  // option two: change the type
  yield {
    description: `change type of ${diff.key}`,
    impact: [PatchImpact.BackwardsIncompatible],
    groupedOperations: changeTypeOperations(),
  };
}
