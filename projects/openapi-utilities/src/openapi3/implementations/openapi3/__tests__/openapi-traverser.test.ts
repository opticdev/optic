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
  expect(traverser.accumulator.allFacts()).toMatchSnapshot();
});
