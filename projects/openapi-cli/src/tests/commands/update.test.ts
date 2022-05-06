import { updateByExample, updateByInteractions } from '../../commands/update';
import { collect, from } from '../../lib/async-tools';
import Path from 'path';
import { HttpMethods } from '../../operations';
import { OpenAPIV3, SpecFilesSourcemap } from '../../specs';
import { CapturedBody, CapturedInteraction } from '../../captures';

describe('update command', () => {
  it('will return an error when trying to update and non-existent spec', async () => {
    const path = Path.join(__dirname, 'a-file-that-doesn-exist.yml');

    const results = await updateByExample(path);

    expect(results.err).toBe(true);
  });

  it('can generate update spec files for component schemas by example', async () => {
    const path = Path.join(
      __dirname,
      '../../../../openapi-utilities/inputs/openapi3/component-schema-examples.json'
    );

    const results = await updateByExample(path);
    const { stats, results: updatedSpecFiles } = results.expect(
      'example spec can be read and processed'
    );

    let specFiles = await collect(updatedSpecFiles);

    expect(specFiles).toHaveLength(1);
    expect(specFiles.map((file) => file.contents)).toMatchSnapshot();
    expect(stats).toMatchSnapshot();
  });

  it('can generate update spec files for request / response examples with partial schemas', async () => {
    const path = Path.join(
      __dirname,
      '../../../../openapi-utilities/inputs/openapi3/operation-examples-with-partial-schemas.json'
    );

    const results = await updateByExample(path);
    const { stats, results: updatedSpecFiles } = results.expect(
      'example spec can be read and processed'
    );

    let specFiles = await collect(updatedSpecFiles);

    expect(specFiles).toHaveLength(1);
    expect(specFiles.map((file) => file.contents)).toMatchSnapshot();
    expect(stats).toMatchSnapshot();
  });

  describe('update by interactions', () => {
    it('can generate updated spec files for new request bodies', async () => {
      const spec = specFixture({
        '/examples/1': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });
      const sourcemap = sourcemapFixture(spec);

      const interactions = [
        interactionFixture(
          '/examples/1',
          HttpMethods.POST,
          CapturedBody.fromJSON({ id: 'an-id' }, 'application/json')
        ),
      ];

      const results = await updateByInteractions(
        spec,
        sourcemap,
        from(interactions)
      );

      const { stats, results: updatedSpecFiles } = results.expect(
        'example spec can be updated'
      );

      let specFiles = await collect(updatedSpecFiles);

      expect(specFiles).toHaveLength(1);
      expect(specFiles).toMatchSnapshot();
    });
  });
});

function specFixture(paths: OpenAPIV3.PathsObject = {}): OpenAPIV3.Document {
  return {
    openapi: '3.0.1',
    paths,
    info: { version: '0.0.0', title: 'Empty' },
  };
}

function sourcemapFixture(spec: OpenAPIV3.Document): SpecFilesSourcemap {
  const mockPath = '/tmp/test-openapi.json';
  const sourcemap = new SpecFilesSourcemap(mockPath);
  sourcemap.addFileIfMissingFromContents(
    mockPath,
    JSON.stringify(spec, null, 2),
    0
  );
  return sourcemap;
}

function interactionFixture(
  path: string,
  method: OpenAPIV3.HttpMethods,
  requestBody: CapturedBody | null = null,
  responseStatusCode: string = '200',
  responseBody: CapturedBody | null = null
): CapturedInteraction {
  return {
    request: {
      host: 'optic.test',
      method,
      path,
      body: requestBody,
    },
    response: {
      statusCode: responseStatusCode,
      body: responseBody,
    },
  };
}
