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
    it('generates updated spec files for new request bodies', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });
      const sourcemap = sourcemapFixture(spec);

      const interactions = [
        interactionFixture(
          '/examples/3',
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

    it('generate patches for multiple interactions for the same operations', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });
      const sourcemap = sourcemapFixture(spec);

      const interactions = [
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            { id: 'an-id', optionalField: 123 },
            'application/json'
          )
        ),
        interactionFixture(
          '/examples/4',
          HttpMethods.POST,
          CapturedBody.fromJSON({ id: 'another-id' }, 'application/json')
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

    it('generates patches for response bodies', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
          [HttpMethods.DELETE]: {
            responses: {},
          },
        },
      });
      const sourcemap = sourcemapFixture(spec);

      const interactions = [
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          null,
          '201',
          CapturedBody.fromJSON(
            { id: 'an-id', optionalField: 123 },
            'application/json'
          )
        ),
        interactionFixture(
          '/examples/4',
          HttpMethods.POST,
          null,
          '201',
          CapturedBody.fromJSON({ id: 'another-id' }, 'application/json')
        ),
        interactionFixture(
          '/examples/4',
          HttpMethods.POST,
          null,
          '400',
          CapturedBody.fromJSON(
            { error: 'an error message' },
            'application/json'
          )
        ),
        interactionFixture(
          '/examples/4',
          HttpMethods.DELETE,
          null,
          '204',
          null
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

    it('ignores interactions for undocumented operations', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });
      const sourcemap = sourcemapFixture(spec);

      const interactions = [
        interactionFixture('/examples/3', HttpMethods.POST),
        interactionFixture('/examples/4', HttpMethods.POST),
        interactionFixture('/examples/4', HttpMethods.DELETE),
        interactionFixture('/examples', HttpMethods.POST),
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

    it('generates patches to extend existing request or response bodies', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'created resource',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                      },
                      required: ['id'],
                    },
                  },
                },
              },
            },
          },
        },
      });
      const sourcemap = sourcemapFixture(spec);

      const interactions = [
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            {
              id: 'an-id',
              newField: 123,
              optionalBoolean: true,
            },
            'application/json'
          ),
          '201',
          CapturedBody.fromJSON(
            { id: 'an-id', newField: 123 },
            'application/json'
          )
        ),
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            {
              id: 'an-id',
              newField: 123,
            },
            'application/json'
          ),
          '201',
          CapturedBody.fromJSON(
            {
              id: 'an-id',
              newField: 123,
              optionalBoolean: true,
            },
            'application/json'
          )
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

    it('only generates patches for request bodies with 2xx and 3xx responses', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
            },
            responses: {},
          },
        },
      });
      const sourcemap = sourcemapFixture(spec);

      const interactions = [
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            {
              id: 'an-id',
              newField: 123,
            },
            'application/json'
          ),
          '201'
        ),
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            {
              // should not be learned, leaving newField as required
              id: 'an-id',
            },
            'application/json'
          ),
          '400'
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
