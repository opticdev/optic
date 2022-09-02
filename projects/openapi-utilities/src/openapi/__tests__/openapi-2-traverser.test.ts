import { OpenAPI2Traverser } from '../openapi2/openapi-2-traverser';
import { parseOpenAPIWithSourcemap } from '@useoptic/openapi-io';

it('can extract facts from petstore example', async () => {
  const traverser = new OpenAPI2Traverser();

  const { jsonLike } = await parseOpenAPIWithSourcemap(
    './inputs/openapi2/petstore.json'
  );

  traverser.traverse(jsonLike);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('can extract facts from azure example 1', async () => {
  const traverser = new OpenAPI2Traverser();

  const { jsonLike } = await parseOpenAPIWithSourcemap(
    './inputs/openapi2/azure-api-managment.json'
  );

  traverser.traverse(jsonLike);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('can extract facts from azure example 2', async () => {
  const traverser = new OpenAPI2Traverser();

  const { jsonLike } = await parseOpenAPIWithSourcemap(
    './inputs/openapi2/azure-quantum.json'
  );

  traverser.traverse(jsonLike);
  expect([...traverser.facts()]).toMatchSnapshot();
});
