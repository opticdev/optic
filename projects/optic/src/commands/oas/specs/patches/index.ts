import {
  PatchImpact,
  PatchOperationGroup,
  PatchOperation,
} from '../../../capture/patches/patch-operations';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OperationPatch } from '../../operations';
import { OpenAPIV3 } from '..';
import JsonPatch from 'fast-json-patch';
import { OperationDiffResult } from '../../operations/diffs';
import { SentryClient } from '../../../../sentry';
import { logger } from '../../../../logger';
import { ShapeDiffResult } from '../../../capture/patches/patchers/shapes/diff';
import { ShapePatch } from '../../../capture/patches/patchers/shapes/patches';
import { ShapeLocation } from '../../../capture/patches/patchers/shapes/documented-bodies';

export { newSpecPatches } from './generators/new-spec';
export { templatePatches } from './generators/template';
export { undocumentedOperationPatches } from './generators';
export type {
  ObservedSpecPatchGenerator,
  ObservedSpecPatchGeneratorContext,
} from './generators/template';

export interface SpecPatch {
  description: string;
  path: string;
  diff: ShapeDiffResult | OperationDiffResult | undefined;
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
      diff: shapePatch.diff,
      path: schemaPath,
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
  static fromExistingRef(
    shapePatch: ShapePatch,
    bodySpecPath: string,
    location: ShapeLocation
  ) {
    const inComponentSchema = 'inComponentSchema' in location;

    const schemaPath = inComponentSchema
      ? bodySpecPath
      : jsonPointerHelpers.append(bodySpecPath, 'schema');

    return {
      description: shapePatch.description,
      impact: shapePatch.impact,
      diff: shapePatch.diff,
      path: schemaPath,
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
      diff: operationPatch.diff,
      path: operationSpecPath,
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
    const operations = JsonPatch.deepClone([...SpecPatch.operations(patch)]);
    try {
      const result = JsonPatch.applyPatch(
        spec,
        operations,
        undefined,
        false // don't mutate the original spec
      );

      return result.newDocument!;
    } catch (e) {
      logger.debug({
        location: 'schema',
        error: e,
        operations: JSON.stringify(operations),
        parsed: JSON.stringify(spec),
      });
      SentryClient.captureException(e, {
        extra: {
          operations,
        },
      });
      throw e;
    }
  }

  static *operations(patch: ShapePatch): IterableIterator<PatchOperation> {
    for (let group of patch.groupedOperations) {
      for (const op of group.operations) {
        yield op;
      }
    }
  }
}
