import { OpenAPITraverser } from '../openapi-traverser';
import fs from 'fs-extra';

const jsonFromFile = async (path: string) => {
  const bytes = await fs.readJson(path);
  return bytes;
};

it('can extract facts from specs', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile(
    './inputs/openapi3/petstore0.json.flattened-without-sourcemap.json'
  );
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('will extract facts for oneOf, allOf or anyOf schemas', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile('./inputs/openapi3/polymorphic-schemas.json');
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});

it('can extract body example facts from specs', async () => {
  const traverser = new OpenAPITraverser();
  const spec = await jsonFromFile(
    './inputs/openapi3/operation-examples-without-schemas.json'
  );
  traverser.traverse(spec);
  expect([...traverser.facts()]).toMatchSnapshot();
});
