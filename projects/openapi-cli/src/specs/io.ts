import {
  parseOpenAPIWithSourcemap,
  ParseOpenAPIResult,
  JSONParserError,
  JsonSchemaSourcemap,
} from '@useoptic/openapi-io';
import { Result, Ok, Err } from 'ts-results';
import { OpenAPI } from 'openapi-types';
import { OpenAPIV3 } from '../lib';

export async function readDeferencedSpec(path: string): Promise<
  Result<
    {
      jsonLike: OpenAPIV3.Document;
      sourcemap: JsonSchemaSourcemap;
    },
    JSONParserError
  >
> {
  try {
    const { jsonLike, sourcemap } = await parseOpenAPIWithSourcemap(path);
    return Ok({ jsonLike: jsonLike as OpenAPIV3.Document, sourcemap });
  } catch (err) {
    if (err instanceof JSONParserError) {
      return Err(err);
    } else {
      // all errors should be considered unrecoverable, so panic (throw)
      throw err;
    }
  }
}
