import { PatchImpact, ShapePatch } from '../patches';
import { Schema } from '../schema';
import { diffBodyBySchema } from '../diffs';
import { newSchemaPatch, generateShapePatchesByDiff } from '../patches';
import { DocumentedBody } from '../body';
import { SupportedOpenAPIVersions } from '@useoptic/openapi-io';

export interface ShapePatches extends Iterable<ShapePatch> {}

const MAX_ITERATIONS = 100;

export class ShapePatches {
  static *generateBodyAdditions(
    documentedBody: DocumentedBody,
    openAPIVersion: SupportedOpenAPIVersions
  ): ShapePatches {
    let { body: optionalBody, schema, shapeLocation } = documentedBody;

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

      let shapeDiffs = diffBodyBySchema(body, schema);

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
