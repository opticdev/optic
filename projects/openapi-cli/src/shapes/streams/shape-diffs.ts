import { OpenAPIV3 } from '@useoptic/openapi-utilities';

import { DocumentedBody } from '../body';
import { diffBodyBySchema } from '../diffs';

export async function* fromDocumentedBodies(
  bodies: AsyncIterable<DocumentedBody>
) {
  for await (let { body, schema } of bodies) {
    if (!schema) return;
    yield* diffBodyBySchema(body, schema);
  }
}
