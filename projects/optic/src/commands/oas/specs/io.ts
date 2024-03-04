import {
  parseOpenAPIWithSourcemap,
  ParseOpenAPIResult,
  JSONParserError,
} from '@useoptic/openapi-io';
import { Result, Ok, Err } from 'ts-results';

export async function readDeferencedSpec(
  path: string
): Promise<Result<ParseOpenAPIResult<any>, JSONParserError>> {
  try {
    return Ok(await parseOpenAPIWithSourcemap(path));
  } catch (err) {
    if (err instanceof JSONParserError) {
      return Err(err);
    } else {
      // all errors should be considered unrecoverable, so panic (throw)
      throw err;
    }
  }
}
