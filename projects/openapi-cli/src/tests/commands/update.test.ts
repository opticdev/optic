import {
  updateByInteractions,
  UpdateObservations,
} from '../../commands/update';
import { collect, from, count } from '../../lib/async-tools';
import { HttpMethods } from '../../operations';
import {
  OpenAPIV3,
  SpecFilesSourcemap,
  SpecPatch,
  SpecPatches,
} from '../../specs';
import { CapturedBody, CapturedInteraction } from '../../captures';

describe('update command', () => {
  describe('update by interactions', () => {
    it('generates updated spec files for new request bodies', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });

      const interactions = [
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON({ id: 'an-id' }, 'application/json')
        ),
      ];

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
    });

    it('generate patches for multiple interactions for the same operations', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });
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

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
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

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
    });

    it('ignores interactions for undocumented operations', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });

      const interactions = [
        interactionFixture('/examples/3', HttpMethods.POST),
        interactionFixture('/examples/4', HttpMethods.POST),
        interactionFixture('/examples/4', HttpMethods.DELETE),
        interactionFixture('/examples', HttpMethods.POST),
      ];

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
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

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
    });

    it('only generates patches for request bodies with 2xx and 3xx responses', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });

      const interactions = [
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            // should not be learned
            {
              id: 'an-id',
            },
            'application/json'
          ),
          '400'
        ),
      ];

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
    });

    it('only generates patches for 2xx, 3xx and 4xx responses', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {},
          },
        },
      });

      const interactions = [
        interactionFixture('/examples/3', HttpMethods.POST, null, '101'),
        interactionFixture('/examples/3', HttpMethods.POST, null, '201'),
        interactionFixture('/examples/3', HttpMethods.POST, null, '302'),
        interactionFixture('/examples/3', HttpMethods.POST, null, '400'),
        interactionFixture('/examples/3', HttpMethods.DELETE, null, '500'),
      ];

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
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

async function resultingPatches(result: {
  results: SpecPatches;
  observations: UpdateObservations;
}): Promise<SpecPatch[]> {
  const patching = collect(result.results);
  const observing = count(result.observations);

  const [patches] = await Promise.all([patching, observing]);
  return patches;
}

function patchSpec(spec, patches: SpecPatch[]) {
  let updatedSpec = spec;
  for (let patch of patches) {
    updatedSpec = SpecPatch.applyPatch(patch, updatedSpec);
  }
  return updatedSpec;
}
