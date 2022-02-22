import { ShapePatch } from '../patches';
import { DocumentedBodies, diffBodyBySchema, generateShapePatches } from '..';
import { DocumentedBody } from '../body';

export interface ShapePatches extends Iterable<ShapePatch> {}

export class ShapePatches {
  static *generateByDiffingBody(documentedBody: DocumentedBody): ShapePatches {
    let { body, schema, bodyLocation } = documentedBody;
    let shapeDiff;
    if (schema) {
      shapeDiff = diffBodyBySchema(body, schema).next().value; // TODO: patches for all diffs
    }

    if (schema && shapeDiff) {
      // TODO: also generate shape patches for new schemas
      yield* generateShapePatches(shapeDiff, schema, {
        location: bodyLocation,
      });
    }
  }
}
