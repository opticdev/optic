import { loadSpecFromFile } from '../../index';
import path from 'path';
import { collectFilePatchesFromInMemoryUpdates } from '../reconciler';
import { OpenAPIV3 } from 'openapi-types';
import { PatchApplyResult } from '../roundtrip-provider';

async function fixture(loadSpec: string) {
  return await loadSpecFromFile(loadSpec, true);
}

function cleanSnapshot(input: PatchApplyResult) {
  if (input.filePath) {
    input.filePath = path.parse(input.filePath).name;
  }
  return input;
}

test('specs can be updated in-memory', async () => {
  const input = await fixture(
    path.join(
      __dirname,
      '../../../inputs/openapi3-with-references/openapi.yaml'
    )
  );

  const virtual = collectFilePatchesFromInMemoryUpdates<OpenAPIV3.Document>({
    jsonLike: input.flattened as OpenAPIV3.Document,
    sourcemap: input.sourcemap!,
  });

  await virtual.update((yourJsonLike) => {
    // add title
    yourJsonLike.info.title = 'Changed ya';
    // make everything optional
    // @ts-ignore
    yourJsonLike.paths['/example']!['get']!.responses['200'].content[
      'application/json'
    ].schema.required = [];
  });

  const asFilePatches = await virtual.toFilePatches();
  asFilePatches.forEach(cleanSnapshot);
  expect(asFilePatches).toMatchSnapshot();
});
