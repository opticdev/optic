import {
  PatchImpact,
  PatchOperationGroup,
  PatchOperation,
} from '../../patch-operations';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import JsonPatch from 'fast-json-patch';

import { ShapeDiffResult, UnpatchableDiff } from '../../patchers/shapes/diff';
import { ShapePatch, ShapePatches } from '../../patchers/shapes/patches';
import {
  DocumentedBodies,
  DocumentedBody,
  ShapeLocation,
} from '../../patchers/shapes/documented-bodies';
import { CapturedInteraction } from '../../../sources/captured-interactions';
import { SentryClient } from '../../../../../sentry';
import { logger } from '../../../../../logger';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { SchemaObject } from '../shapes/schema';
import { DocumentedInteraction } from '../../../../oas/operations';
import { OperationPatch, generateOperationPatches } from './operations';
import { OperationDiffResult } from './types';

export interface SpecPatch {
  description: string;
  path: string;
  diff: ShapeDiffResult | OperationDiffResult | undefined;
  impact: PatchImpact[];
  groupedOperations: PatchOperationGroup[];
  interaction?: CapturedInteraction;
}

export { PatchImpact, PatchOperationGroup as OperationGroup };
export type { PatchOperation as Operation };

export class SpecPatch {
  static fromShapePatch(
    shapePatch: ShapePatch,
    bodySpecPath: string,
    location: ShapeLocation
  ): SpecPatch {
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
      interaction: shapePatch.interaction,
    };
  }

  static fromOperationPatch(
    operationPatch: OperationPatch,
    interaction: CapturedInteraction,
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
      interaction,
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

  static *operations(
    patch: Pick<ShapePatch, 'groupedOperations'>
  ): IterableIterator<PatchOperation> {
    for (let group of patch.groupedOperations) {
      for (const op of group.operations) {
        yield op;
      }
    }
  }
}

export interface SpecPatches extends AsyncIterable<SpecPatch> {}

export class SpecPatches {
  static async *shapeAdditions(
    documentedBodies: DocumentedBodies,
    openAPIVersion: SupportedOpenAPIVersions
  ): AsyncIterable<SpecPatch | UnpatchableDiff> {
    const updatedSchemasByPath: Map<string, SchemaObject> = new Map();
    for await (let documentedBody of documentedBodies) {
      let { specJsonPath, shapeLocation } = documentedBody;

      if (updatedSchemasByPath.has(specJsonPath)) {
        documentedBody.schema = updatedSchemasByPath.get(specJsonPath) ?? null;
      }

      for (let patchOrDiff of ShapePatches.generateBodyAdditions(
        documentedBody,
        openAPIVersion
      )) {
        if ('unpatchable' in patchOrDiff) {
          yield patchOrDiff;
        } else {
          documentedBody = DocumentedBody.applyShapePatch(
            documentedBody,
            patchOrDiff
          );
          yield SpecPatch.fromShapePatch(
            patchOrDiff,
            specJsonPath,
            shapeLocation!
          );
        }
      }

      updatedSchemasByPath.set(specJsonPath, documentedBody.schema!);
    }
  }

  static async *operationAdditions(
    documentedInteraction: DocumentedInteraction
  ) {
    const operationPatches = generateOperationPatches(documentedInteraction);

    for (let patch of operationPatches) {
      const specPatch = SpecPatch.fromOperationPatch(
        patch,
        documentedInteraction.interaction,
        documentedInteraction.specJsonPath
      );

      yield specPatch;
    }
  }
}
