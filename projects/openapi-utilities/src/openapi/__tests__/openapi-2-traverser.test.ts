import { OpenAPI2Traverser } from '../openapi2/openapi-2-traverser';
import {
  JsonSchemaSourcemap,
  parseOpenAPIWithSourcemap,
} from '@useoptic/openapi-io';
import { OpenAPI, OpenAPIV2 } from 'openapi-types';

/* This is experimental, so rather than update our sourcemap loaders everywhere to return the correct types, I added this
 *  Sourcemap parser technically returns `any` -- there is zero validation. It only throws if a $ref is not resolvable
 *  We should probably not assume any type about the results here until AFTER it comes out of the validate function.
 *  */
type TMP_OpenAPI2Results = {
  jsonLike: OpenAPIV2.Document;
  sourcemap: JsonSchemaSourcemap;
};

it('can extract facts from petstore example', async () => {
  const traverser = new OpenAPI2Traverser();

  const { jsonLike } = (await parseOpenAPIWithSourcemap(
    './inputs/openapi2/petstore.json'
  )) as unknown as TMP_OpenAPI2Results;

  traverser.traverse(jsonLike);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('can extract facts from azure example 1', async () => {
  const traverser = new OpenAPI2Traverser();

  const { jsonLike } = (await parseOpenAPIWithSourcemap(
    './inputs/openapi2/azure-api-managment.json'
  )) as unknown as TMP_OpenAPI2Results;

  traverser.traverse(jsonLike);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('can extract facts from azure example 2', async () => {
  const traverser = new OpenAPI2Traverser();

  const { jsonLike } = (await parseOpenAPIWithSourcemap(
    './inputs/openapi2/azure-quantum.json'
  )) as unknown as TMP_OpenAPI2Results;

  traverser.traverse(jsonLike);
  expect([...traverser.facts()]).toMatchSnapshot();
});
