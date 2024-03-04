import zlib from 'node:zlib';
import {
  OpenAPIV3,
  compareSpecs,
  getEndpointId,
  FlatOpenAPIV3,
  FlatOpenAPIV3_1,
  FlatOpenAPIV2,
} from '@useoptic/openapi-utilities';
import { ParseResult } from '../../utils/spec-loaders';
import { compute } from './compute';
import { normalizeOpenApiPath } from '@useoptic/openapi-utilities/build/openapi3/implementations/openapi3/openapi-traverser';

type SpecResultsV2 = Awaited<ReturnType<typeof compareSpecs>>;

// We can remove the components from spec since the changelog is flattened, and any valid refs will
// already be added into endpoints they're used in
const removeComponentsFromSpec = (
  spec:
    | FlatOpenAPIV2.Document
    | FlatOpenAPIV3.Document
    | FlatOpenAPIV3_1.Document
):
  | FlatOpenAPIV2.Document
  | FlatOpenAPIV3.Document
  | FlatOpenAPIV3_1.Document => {
  const { components, definitions, ...componentlessSpec } = spec as any;
  return componentlessSpec;
};

const removeUnusedEndpoints = (
  spec:
    | FlatOpenAPIV2.Document
    | FlatOpenAPIV3.Document
    | FlatOpenAPIV3_1.Document,
  changelogData: Awaited<ReturnType<typeof compute>>['changelogData']
):
  | FlatOpenAPIV2.Document
  | FlatOpenAPIV3.Document
  | FlatOpenAPIV3_1.Document => {
  const { paths, ...specWithoutPaths } = spec;
  const newPaths = {};
  for (const [pathPattern, methodObj] of Object.entries(paths ?? {})) {
    newPaths[pathPattern] = {};
    for (const method of Object.values(OpenAPIV3.HttpMethods)) {
      const normalized = normalizeOpenApiPath(pathPattern);
      const operation = methodObj?.[method];
      const hasChangelogDataForEndpoint =
        getEndpointId({ method, path: normalized }) in changelogData.endpoints;
      if (operation && hasChangelogDataForEndpoint) {
        newPaths[pathPattern][method] = operation;
      }
    }
  }

  return {
    ...specWithoutPaths,
    paths: newPaths,
  };
};

export const compressDataV2 = (
  baseFile: ParseResult,
  headFile: ParseResult,
  specResults: SpecResultsV2,
  meta: Record<string, unknown>,
  changelogData: Awaited<ReturnType<typeof compute>>['changelogData']
): string => {
  const dataToCompress = {
    base: removeUnusedEndpoints(
      removeComponentsFromSpec(baseFile.jsonLike),
      changelogData
    ),
    head: removeUnusedEndpoints(
      removeComponentsFromSpec(headFile.jsonLike),
      changelogData
    ),
    results: {
      ...specResults,
      results: specResults.results.filter((r) => !r.passed),
    },
    meta,
    version: '2',
  };
  const compressed = zlib.brotliCompressSync(
    Buffer.from(JSON.stringify(dataToCompress))
  );
  const urlSafeString = Buffer.from(compressed).toString('base64');
  return urlSafeString;
};
