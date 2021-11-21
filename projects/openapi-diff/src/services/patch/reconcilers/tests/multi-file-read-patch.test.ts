import path from 'path';
import { createOpenApiFileSystemReader } from '../read';

const filePath = path.join(__dirname, 'example', 'with-body-ref.json');

describe('multi file read patch', () => {
  it('can parse an OpenAPI across file system from root', async () => {
    const reader = createOpenApiFileSystemReader(filePath);
    expect(await reader.flattenedSpecification()).toMatchSnapshot();
  });
});
