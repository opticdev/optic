import {
  PatchImpact,
  PatchOperationGroup,
  PatchOperation,
} from '../../patches';
import { ShapePatch } from '../../shapes/patches';
import { ShapeLocation } from '../../shapes';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OperationPatch } from '../../operations';
import { OpenAPIV3 } from '..';
import JsonPatch from 'fast-json-patch';

export { newSpecPatches } from './generators/new-spec';
export { templatePatches } from './generators/template';
export { undocumentedOperationPatches } from './generators';
export type {
  ObservedSpecPatchGenerator,
  ObservedSpecPatchGeneratorContext,
} from './generators/template';

export interface SpecPatch {
  description: string;
  impact: PatchImpact[];
  groupedOperations: PatchOperationGroup[];
}

export { PatchImpact, PatchOperationGroup as OperationGroup };
export type { PatchOperation as Operation };

export class SpecPatch {
  static fromShapePatch(
    shapePatch: ShapePatch,
    bodySpecPath: string,
    location: ShapeLocation
  ) {
    const inResponse = 'inResponse' in location;
    const inComponentSchema = 'inComponentSchema' in location;

    const schemaPath = inComponentSchema
      ? bodySpecPath
      : jsonPointerHelpers.append(bodySpecPath, 'schema');

    return {
      description: `update ${
        inComponentSchema
          ? 'component schema'
          : inResponse
          ? 'response body'
          : 'request body'
      }: ${shapePatch.description}`,
      impact: shapePatch.impact,
      groupedOperations: shapePatch.groupedOperations.map((group) => {
        return {
          ...group,
          operations: group.operations.map((op) => ({
            ...op,
            path: jsonPointerHelpers.join(schemaPath, op.path),
          })),
        };
      }),
    };
  }

  static fromOperationPatch(
    operationPatch: OperationPatch,
    operationSpecPath: string
  ): SpecPatch {
    return {
      description: `operation: ${operationPatch.description}`,
      impact: operationPatch.impact,
      groupedOperations: operationPatch.groupedOperations.map((group) => {
        return {
          ...group,
          operations: group.operations.map((op) => ({
            ...op,
            path: jsonPointerHelpers.join(operationSpecPath, op.path),
          })),
        };
      }),
    };
  }

  static applyPatch(patch: SpecPatch, spec: OpenAPIV3.Document) {
    const result = JsonPatch.applyPatch(
      spec,
      [...SpecPatch.operations(patch)],
      undefined,
      false // don't mutate the original spec
    );

    return result.newDocument!;
  }

  static *operations(patch: ShapePatch): IterableIterator<PatchOperation> {
    for (let group of patch.groupedOperations) {
      yield* PatchOperationGroup.operations(group);
    }
  }
}
