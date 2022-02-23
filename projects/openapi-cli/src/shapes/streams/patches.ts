import { PatchImpact, ShapePatch } from '../patches';
import { Schema } from '../schema';
import { diffBodyBySchema } from '../diffs';
import { newSchemaPatch, generateShapePatchesByDiff } from '../patches';
import { DocumentedBody } from '../body';

export interface ShapePatches extends Iterable<ShapePatch> {}

export class ShapePatches {
  static *generateFromBody(
    documentedBody: DocumentedBody,
    filter: (patch: ShapePatch) => boolean
  ): ShapePatches {
    let { body, schema, bodyLocation } = documentedBody;

    if (schema) {
      let shapeDiffs = diffBodyBySchema(body, schema);

      for (let shapeDiff of shapeDiffs) {
        let diffPatches = generateShapePatchesByDiff(shapeDiff, schema, {
          location: bodyLocation,
        });

        for (let patch of diffPatches) {
          if (!filter(patch)) continue;

          schema = Schema.applyShapePatch(schema, patch);
          yield patch;
        }
      }
    } else {
      let newSchema = Schema.fromValue(body.value);

      yield newSchemaPatch(newSchema, { location: bodyLocation });
    }
  }
}
