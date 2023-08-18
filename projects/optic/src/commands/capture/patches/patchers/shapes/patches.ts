import { ShapeDiffResult, UnpatchableDiff, diffBodyBySchema } from './diff';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';
import { oneOfPatches } from './handlers/oneOf';
import { requiredPatches } from './handlers/required';
import {
  PatchImpact,
  PatchOperation,
  PatchOperationGroup,
} from '../../patch-operations';
import { logger } from '../../../../../logger';
import { SentryClient } from '../../../../../sentry';
import { newSchemaPatch } from './handlers/newSchema';
import { enumPatches } from './handlers/enum';
import { typePatches } from './handlers/type';
import { additionalPropertiesPatches } from './handlers/additionalProperties';
import { Schema, SchemaObject } from './schema';
import { DocumentedBody, ShapeLocation } from './documented-bodies';
import { CapturedInteraction } from '../../../sources/captured-interactions';
import { OperationDiffResult } from '../spec/types';

export function* generateShapePatchesByDiff(
  diff: ShapeDiffResult,
  schema: SchemaObject,
  interaction: CapturedInteraction,
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
    yield* generator(diff, schema, interaction, shapeContext, openAPIVersion);
  }
}

export interface ShapePatch {
  description: string;
  interaction: CapturedInteraction;
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
  ): Iterable<ShapePatch | UnpatchableDiff> {
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
    while (!patchesExhausted) {
      i++;
      if (!schema || (!schema.type && !Schema.isPolymorphic(schema))) {
        let newSchema = Schema.baseFromValue(body.value, openAPIVersion);
        let patch = newSchemaPatch(
          newSchema,
          schema || null,
          documentedBody.interaction,
          {
            location: shapeLocation || undefined,
          }
        );

        yield patch;

        schema = Schema.applyShapePatch(schema, patch);
      }

      let shapeDiffsOpt = diffBodyBySchema(body, schema, {
        specJsonPath,
        interaction: documentedBody.interaction,
      });
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
        if ('unpatchable' in shapeDiff) continue;
        let diffPatches = generateShapePatchesByDiff(
          shapeDiff,
          schema,
          documentedBody.interaction,
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
      if (patchesExhausted || i === MAX_ITERATIONS) {
        // diff the final schema + emit the results
        let shapeDiffsOpt = diffBodyBySchema(body, schema, {
          specJsonPath,
          interaction: documentedBody.interaction,
        });
        if (!shapeDiffsOpt.err) {
          // TODO collect and dedupe by keyword + schema path
          for (const diff of shapeDiffsOpt.val) {
            if ('unpatchable' in diff) {
              yield diff;
            }
          }
        }

        if (i === MAX_ITERATIONS) {
          SentryClient.captureException(
            new Error('max iterations in shape patches hit'),
            {
              extra: {
                body,
                schema,
              },
            }
          );
        }
        break;
      }
    }
  }
}
