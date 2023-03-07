import Path from 'path';
import { readDeferencedSpec, SpecFacts } from '../../specs';

const petstorePath = Path.join(
  __dirname,
  '../../../../../../openapi-utilities/inputs/openapi3/petstore0.json.flattened-without-sourcemap.json'
);

export async function* petstore(): SpecFacts {
  const { jsonLike: spec } = (await readDeferencedSpec(petstorePath)).unwrap();
  yield* SpecFacts.fromOpenAPISpec(spec);
}
