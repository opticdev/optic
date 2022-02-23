import { ShapePatch } from '../patches';
import { Schema } from '../schema';
import { diffBodyBySchema } from '../diffs';
import { newSchemaPatch, generateShapePatchesByDiff } from '../patches';
import { DocumentedBody } from '../body';

export interface ShapePatches extends Iterable<ShapePatch> {}

export class ShapePatches {
  static *generateFromBody(documentedBody: DocumentedBody): ShapePatches {
    let { body, schema, bodyLocation } = documentedBody;

    if (schema) {
      let shapeDiffs = diffBodyBySchema(body, schema);

      for (let shapeDiff of shapeDiffs) {
        yield* generateShapePatchesByDiff(shapeDiff, schema, {
          location: bodyLocation,
        });
      }
    } else {
      let newSchema = Schema.fromValue(body.value);

      yield newSchemaPatch(newSchema, { location: bodyLocation });
    }
  }
}
