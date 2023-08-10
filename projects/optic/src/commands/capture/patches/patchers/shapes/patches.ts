import {
  DocumentedBody,
  Schema,
  SchemaObject,
  ShapeLocation,
} from '../../../../oas/shapes';
import { ShapeDiffResult, diffBodyBySchema } from './diff';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { oneOfPatches } from './handlers/oneOf';
import { requiredPatches } from './handlers/required';
import { OperationDiffResult } from '../../../../oas/operations/diffs';
import {
  PatchImpact,
  PatchOperation,
  PatchOperationGroup,
} from '../../../../oas/patches';
import { logger } from '../../../../../logger';
import { SentryClient } from '../../../../../sentry';
import { newSchemaPatch } from './handlers/newSchema';
import { enumPatches } from './handlers/enum';
import { typePatches } from './handlers/type';
import { additionalPropertiesPatches } from './handlers/additionalProperties';

export function* generateShapePatchesByDiff(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  shapeContext: { location?: ShapeLocation },
  openAPIVersion: SupportedOpenAPIVersions
): IterableIterator<ShapePatch> {
  for (let generator of [
    oneOfPatches,
    requiredPatches,
    enumPatches,
    typePatches,
    additionalPropertiesPatches,
  ]) {
    yield* generator(diff, schema, shapeContext, openAPIVersion);
  }
}

export interface ShapePatch {
  description: string;
  diff: ShapeDiffResult | OperationDiffResult | undefined;
  impact: PatchImpact[];
  groupedOperations: PatchOperationGroup[];
  shouldRegeneratePatches?: boolean;
}

export class ShapePatch {
  static *operations(patch: ShapePatch): IterableIterator<PatchOperation> {
    for (let group of patch.groupedOperations) {
      yield* PatchOperationGroup.operations(group);
    }
  }

  static isAddition(patch: ShapePatch): boolean {
    return patch.impact.includes(PatchImpact.Addition);
  }
}

export interface ShapePatches extends Iterable<ShapePatch> {}

const MAX_ITERATIONS = 100;

export class ShapePatches {
  static *generateBodyAdditions(
    documentedBody: DocumentedBody,
    openAPIVersion: SupportedOpenAPIVersions
  ): ShapePatches {
    let {
      body: optionalBody,
      schema,
      shapeLocation,
      specJsonPath,
    } = documentedBody;

    if (optionalBody.none) return; // no patches if there is no body
    let body = optionalBody.unwrap();

    let patchesExhausted = false;
    let i = 0;
    while (!patchesExhausted && i < MAX_ITERATIONS) {
      i++;
      if (!schema || (!schema.type && !Schema.isPolymorphic(schema))) {
        let newSchema = Schema.baseFromValue(body.value, openAPIVersion);
        let patch = newSchemaPatch(newSchema, schema || null, {
          location: shapeLocation || undefined,
        });

        yield patch;

        schema = Schema.applyShapePatch(schema, patch);
      }

      let shapeDiffsOpt = diffBodyBySchema(body, schema);
      if (shapeDiffsOpt.err) {
        logger.error(`Could not update body at ${specJsonPath}`);
        logger.error(shapeDiffsOpt.val);
        SentryClient.captureException(shapeDiffsOpt.val);
        break;
      }
      let shapeDiffs = shapeDiffsOpt.val;

      let patchCount = 0;
      let shouldRegenerate = false;

      for (let shapeDiff of shapeDiffs) {
        let diffPatches = generateShapePatchesByDiff(
          shapeDiff,
          schema,
          {
            location: shapeLocation || undefined,
          },
          openAPIVersion
        );

        for (let patch of diffPatches) {
          if (!ShapePatch.isAddition(patch)) continue;

          patchCount++;

          schema = Schema.applyShapePatch(schema, patch);
          yield patch;
          // If the patch changes the structure of the schema (e.g. removes / replaces with oneOf), we need to regenerate the patches because the target json path could have moved
          if (patch.shouldRegeneratePatches) shouldRegenerate = true;
        }
        if (shouldRegenerate) break;
      }
      patchesExhausted = patchCount === 0;
    }
  }
}
