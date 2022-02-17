import {
  JsonSchemaKnownKeyword,
  ShapeDiffResult,
  ShapeDiffResultKind,
} from '../../diffs';
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
      groupedOperations.push(
        OperationGroup.create(`add ${diff.key} one of`, {
          op: 'add',
          path: jsonPointerHelpers.append(diff.propertyPath, 'oneOf'),
          value: [currentPropertySchema, Schema.fromValue(diff.example)], // whatever it was before, with whatever it is now
        })
      );

      // TODO: determine how we clean up the schema after we've just changed it to a one-off
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
