import { load } from 'js-yaml';
import {
  OpenAPIV3,
  validateOpenApiV3Document,
} from '@useoptic/openapi-utilities';

const parseOpenApiJSONSpec = (fileString: string) => JSON.parse(fileString);
const parseOpenApiYmlSpec = (fileString: string) => load(fileString);

export type ParseOpenApiSpecResult =
  | { ok: true; result: OpenAPIV3.Document }
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

    const valid = validateOpenApiV3Document(parsed);
    return { ok: true, result: valid };
  } catch (err) {
    return { ok: false };
  }
};
