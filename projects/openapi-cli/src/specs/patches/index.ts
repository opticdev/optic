import { PatchImpact, OperationGroup, Operation } from '../../patches';
import { ShapePatch } from '../../shapes/patches';
import { ShapeLocation } from '../../shapes';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export { templatePatches } from './generators/template';
export type {
  ObservedSpecPatchGenerator,
  ObservedSpecPatchGeneratorContext,
} from './generators/template';

export interface SpecPatch {
  description: string;
  impact: PatchImpact[];
  groupedOperations: OperationGroup[];
}

export { PatchImpact, OperationGroup };
export type { Operation };

export class SpecPatch {
  static fromShapePatch(
    shapePatch: ShapePatch,
    bodySpecPath: string,
    location: ShapeLocation
  ) {
    const inResponse = 'inResponse' in location;

    const schemaPath = jsonPointerHelpers.append(bodySpecPath, 'schema');

    return {
      description: `update ${inResponse ? 'response' : 'request'} body: ${
        shapePatch.description
      }`,
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
}
