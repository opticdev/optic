import { OpenAPIV3 } from '@useoptic/openapi-utilities';

import { Body, SchemaObject } from '../body';
import { diffBodyBySchema } from '../diffs';

export async function* forBodies(
  schema: SchemaObject,
  bodies: AsyncIterable<Body>
) {
  for await (let body of bodies) {
    yield* diffBodyBySchema(body, schema);
  }
}
