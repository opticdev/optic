import { OpenAPIV3 } from '@useoptic/openapi-utilities';

import { Body } from '../events/body';

export async function* forBodies(
  spec: OpenAPIV3.Document,
  bodies: AsyncIterable<Body>
) {}
