import { OpenAPIV3 } from '@useoptic/openapi-utilities';

import { DocumentedBody, SchemaObject } from '../body';
import { diffBodyBySchema } from '../diffs';

export async function* fromDocumentedBodies(
  bodies: AsyncIterable<DocumentedBody>
) {
  for await (let { body, schema, bodyLocation } of bodies) {
    if (!schema) return;
    yield* diffBodyBySchema(body, schema);
  }
}
