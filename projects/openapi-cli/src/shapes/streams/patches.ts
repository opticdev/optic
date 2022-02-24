import { PatchImpact, ShapePatch } from '../patches';
import { Schema } from '../schema';
import { diffBodyBySchema } from '../diffs';
import { newSchemaPatch, generateShapePatchesByDiff } from '../patches';
import { DocumentedBody } from '../body';

export interface ShapePatches extends Iterable<ShapePatch> {}

const MAX_ITERATIONS = 100;

export class ShapePatches {
  static *generateBodyAdditions(documentedBody: DocumentedBody): ShapePatches {
    let { body, schema, bodyLocation } = documentedBody;

    let patchesExhausted = false;
    let i = 0;
    while (!patchesExhausted && i < MAX_ITERATIONS) {
      i++;
      if (!schema) {
        let newSchema = Schema.baseFromValue(body.value);

        yield newSchemaPatch(newSchema, {
          location: bodyLocation || undefined,
        });

        schema = newSchema;
      }

      let shapeDiffs = diffBodyBySchema(body, schema);

      let patchCount = 0;

      for (let shapeDiff of shapeDiffs) {
        let diffPatches = generateShapePatchesByDiff(shapeDiff, schema, {
          location: bodyLocation || undefined,
        });

        for (let patch of diffPatches) {
          if (!ShapePatch.isAddition(patch)) continue;

          patchCount++;

          schema = Schema.applyShapePatch(schema, patch);
          yield patch;
        }
      }
      patchesExhausted = patchCount === 0;
    }
  }
}
