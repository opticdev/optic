import { normalizeOpenApiPath } from '@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/openapi-traverser';
import { createHash } from 'crypto';
import { ParseResult } from './spec-loaders';
import stableStringify from 'json-stable-stringify';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

export function computeChecksum(file: string): string {
  const hash = createHash('sha256');

  hash.update(file);

  return hash.digest('base64');
}

export function computeEndpointChecksum(
  path: string,
  method: string,
  endpointContent: OpenAPIV3.OperationObject
): string | null {
  const hash = createHash('sha256');

  const normalizedUrlPath = normalizeOpenApiPath(path);
  const normalizedContent = {
    [normalizedUrlPath]: {
      [method]: endpointContent,
    },
  };
  hash.update(stableStringify(normalizedContent));

  return hash.digest('hex');
}
