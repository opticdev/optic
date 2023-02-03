import zlib from 'node:zlib';
import { OpenAPIV3, compareSpecs } from '@useoptic/openapi-utilities';
import { ParseResult } from '../../utils/spec-loaders';

type SpecResultsV2 = Awaited<ReturnType<typeof compareSpecs>>;

// We can remove the components from spec since the changelog is flattened, and any valid refs will
// already be added into endpoints they're used in
const removeComponentsFromSpec = (
  spec: OpenAPIV3.Document
): OpenAPIV3.Document => {
  const { components, ...componentlessSpec } = spec;
  return componentlessSpec;
};

export const compressDataV2 = (
  baseFile: ParseResult,
  headFile: ParseResult,
  specResults: SpecResultsV2,
  meta: Record<string, unknown>
): string => {
  const dataToCompress = {
    base: removeComponentsFromSpec(baseFile.jsonLike),
    head: removeComponentsFromSpec(headFile.jsonLike),
    results: specResults,
    meta,
    version: '2',
  };
  const compressed = zlib.brotliCompressSync(
    Buffer.from(JSON.stringify(dataToCompress))
  );
  const urlSafeString = Buffer.from(compressed).toString('base64');
  return urlSafeString;
};
