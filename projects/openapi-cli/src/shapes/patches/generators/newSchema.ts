import { Schema, SchemaObject } from '../../schema';
import { ShapeLocation } from '../..';
import { OperationGroup, PatchImpact, ShapePatch } from '..';

export function newSchemaPatch(
  schema: SchemaObject,
  typelessSchema: SchemaObject | null,
  shapeContext: { location?: ShapeLocation }
): ShapePatch {
  let groupedOperations = [
    OperationGroup.create(
      'add schema object',
      ...Schema.mergeOperations(typelessSchema, schema)
    ),
  ];

  return {
    description: 'add schema object',
    diff: undefined,
    impact: [
      PatchImpact.Addition,
      !shapeContext.location
        ? PatchImpact.BackwardsCompatibilityUnknown
        : 'inResponse' in shapeContext.location
        ? PatchImpact.BackwardsCompatible
        : PatchImpact.BackwardsIncompatible, // @acunnife, adding a new body to an existing request is backwards-incompatible, right?
    ],
    groupedOperations,
  };
}
