import { loadSpecFromFile } from '../../index';
import path from 'path';
import { collectFilePatchesFromInMemoryUpdates } from '../reconciler';
import { OpenAPIV3 } from 'openapi-types';

async function fixture(loadSpec: string) {
  return await loadSpecFromFile(loadSpec, true);
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

  await virtual.updateInput((yourJsonLike) => {
    // add title
    yourJsonLike.info.title = 'Changed ya';
    // make everything optional
    // @ts-ignore
    yourJsonLike.paths['/example']!['get']!.responses['200'].content[
      'application/json'
    ].schema.required = [];
  });

  const asFilePatches = await virtual.toFilePatches();

  expect(asFilePatches).toMatchSnapshot();
});
