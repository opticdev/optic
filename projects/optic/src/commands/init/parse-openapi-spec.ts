import { load } from 'js-yaml';
import { OpenAPI, validateOpenApiDocument } from '@useoptic/openapi-utilities';

const parseOpenApiJSONSpec = (fileString: string) => JSON.parse(fileString);
const parseOpenApiYmlSpec = (fileString: string) => load(fileString);

export type ParseOpenApiSpecResult =
  | { ok: true; result: OpenAPI.Document }
  | { ok: false };

export const parseOpenApiSpec = (
  fileString: string,
  fileType: 'json' | 'yml'
): ParseOpenApiSpecResult => {
  try {
    const parsed =
      fileType === 'json'
        ? parseOpenApiJSONSpec(fileString)
        : parseOpenApiYmlSpec(fileString);

    const valid = validateOpenApiDocument(parsed);
    return { ok: true, result: valid.document };
  } catch (err) {
    return { ok: false };
  }
};
