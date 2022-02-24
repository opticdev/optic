import { PatchImpact, ShapePatch } from '../patches';
import { Schema } from '../schema';
import { diffBodyBySchema } from '../diffs';
import { newSchemaPatch, generateShapePatchesByDiff } from '../patches';
import { DocumentedBody } from '../body';

export interface ShapePatches extends Iterable<ShapePatch> {}

export class ShapePatches {
  static *generateBodyAdditions(documentedBody: DocumentedBody): ShapePatches {
    let { body, schema, bodyLocation } = documentedBody;

    let patchesExhausted = false;
    while (!patchesExhausted) {
      if (!schema) {
        let newSchema = Schema.baseFromValue(body.value);

        yield newSchemaPatch(newSchema, { location: bodyLocation });

        schema = newSchema;
      }

      let shapeDiffs = diffBodyBySchema(body, schema);

      let patchCount = 0;

      for (let shapeDiff of shapeDiffs) {
        let diffPatches = generateShapePatchesByDiff(shapeDiff, schema, {
          location: bodyLocation,
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
