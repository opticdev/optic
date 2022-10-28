import fs from 'fs-extra';
import { normalizeOperation } from '../normalize-operation';
import { OpenAPIV3 } from 'openapi-types';

const jsonFromFile = async (path: string) => {
  const bytes = await fs.readJson(path);
  return bytes;
};

it('can normalize an openapi operation', async () => {
  const spec = await jsonFromFile(
    './inputs/openapi3/petstore0.json.flattened-without-sourcemap.json'
  );

  const operation = normalizeOperation(
    spec,
    OpenAPIV3.HttpMethods.POST,
    '/pet/{petId}/uploadImage'
  );

  expect(operation).toMatchSnapshot();
});
