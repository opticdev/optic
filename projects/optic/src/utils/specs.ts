import {
  FlatOpenAPIV3,
  FlatOpenAPIV3_1,
  OpenAPIV3,
  defaultEmptySpec,
} from '@useoptic/openapi-utilities';
import { OPTIC_EMPTY_SPEC_KEY, OPTIC_PATH_IGNORE_KEY } from '../constants';
import { JsonSchemaSourcemap } from '@useoptic/openapi-io';
import { logger } from '../logger';

export function getIgnorePaths(
  spec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document
): { path: string; method?: string }[] {
  const ignorePaths: (
    | string
    | {
        method?: string;
        path?: string;
      }
  )[] = spec[OPTIC_PATH_IGNORE_KEY];
  const paths: { path: string; method?: string }[] = [];
  if (!Array.isArray(ignorePaths)) {
    return [];
  } else {
    for (const ignore of ignorePaths) {
      if (typeof ignore === 'string') {
        paths.push({ path: ignore });
      } else if (ignore.method && ignore.path) {
        paths.push({ method: ignore.method, path: ignore.path });
      } else {
        logger.debug(
          `Skipping x-optic-path-ignore ${JSON.stringify(
            ignore
          )} - must be type string or {method: string, path: string}`
        );
      }
    }
  }
  return paths;
}

export function createNewSpecFile(version: string): OpenAPIV3.Document {
  return {
    info: {
      title: 'Untitled service',
      version: '1.0.0',
    },
    openapi: version,
    paths: {},
  };
}

export function createNullSpec(): FlatOpenAPIV3.Document {
  return {
    ...defaultEmptySpec,
    [OPTIC_EMPTY_SPEC_KEY]: true,
  } as FlatOpenAPIV3.Document;
}

export function createNullSpecSourcemap(
  nullSpec: FlatOpenAPIV3.Document
): JsonSchemaSourcemap {
  const emptySpecName = 'empty.json';
  const sourcemap = new JsonSchemaSourcemap(emptySpecName);
  sourcemap.addFileIfMissingFromContents(
    emptySpecName,
    JSON.stringify(nullSpec, null, 2),
    0
  );
  return sourcemap;
}
