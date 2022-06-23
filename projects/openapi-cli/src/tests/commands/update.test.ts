import {
  updateByInteractions,
  UpdateObservations,
  UpdateObservationKind,
  UpdateObservation,
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

    it('generates patches for existing request bodies, matching by various content type formats', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            requestBody: {
              content: {
                'application/json; charset=utf-8': {},
              },
            },
            responses: {},
          },
        },
      });

      const interactions = [
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            { id: 'an-id' },
            'application/json; charset=utf-8'
          )
        ),
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          CapturedBody.fromJSON(
            { id: 'an-id', name: 'a-name' },
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

    it('generates patches for existing response bodies, matching by various content type formats', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {
              201: {
                description: 'created',
                content: {
                  'application/json; charset=utf-8': {},
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
          null,
          '201',
          CapturedBody.fromJSON(
            { id: 'an-id' },
            'application/json; charset=utf-8'
          )
        ),
        interactionFixture(
          '/examples/3',
          HttpMethods.POST,
          null,
          '201',
          CapturedBody.fromJSON(
            { id: 'an-id', name: 'a-name' },
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

    it('does not generate patches for bodies with invalid schemas', async () => {
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
                        nullable: true, // nullable without a `type` is invalid JSON Schema
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
      ];

      const results = await updateByInteractions(spec, from(interactions));

      const specPatches = await resultingPatches(
        results.expect('example spec can be updated')
      );

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
    });

    it('adds bodies for unsupported content types, but does not generate schemas for them', async () => {
      const spec = specFixture({
        '/examples/{exampleId}': {
          [HttpMethods.POST]: {
            responses: {
              201: {
                description: 'created response',
                content: {},
              },
            },
          },
        },
      });

      const interactions = [
        interactionFixture(
          // update command does not support generating csv bodies definitions
          '/examples/3',
          HttpMethods.POST,
          null,
          '201',
          CapturedBody.from('id,name\n,an-id,a-name', 'text/csv')
        ),
        interactionFixture(
          // update command does not support generating xml bodies definitions
          '/examples/4',
          HttpMethods.POST,
          null,
          '201',
          CapturedBody.from(
            '<example><id>3</id><name>a-name</name></example>',
            'application/xml'
          )
        ),
        interactionFixture(
          '/examples/5',
          HttpMethods.POST,
          null,
          '201',
          CapturedBody.fromJSON(
            { id: 'an-id', name: 'a-name' },
            'application/json'
          )
        ),
      ];

      const results = (
        await updateByInteractions(spec, from(interactions))
      ).expect('example spec can be updated');

      const [specPatches, observations] = await Promise.all([
        collect(results.results),
        collect(results.observations),
      ]);

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(spec, specPatches);
      expect(updatedSpec).toMatchSnapshot();

      const bodyMatchObservations = observationsOfKind(
        observations,
        UpdateObservationKind.InteractionBodyMatched
      );

      const xmlBodyObservation = bodyMatchObservations.find(
        (observation) => observation.capturedContentType === 'application/xml'
      );
      const csvBodyObservation = bodyMatchObservations.find(
        (observation) => observation.capturedContentType === 'text/csv'
      );

      expect(xmlBodyObservation?.decodable).toBe(false);
      expect(csvBodyObservation?.decodable).toBe(false);
    });
  });

  it('generates patches for all standard json content types', async () => {
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
          'application/vnd.api+json' // IETF RFC 6839
        )
      ),
      interactionFixture(
        '/examples/4',
        HttpMethods.POST,
        null,
        '201',
        CapturedBody.fromJSON(
          { id: 'another-id', opticField: 'woo' },
          'application/vnd.optic+json' // IETF RFC 6839
        )
      ),
      interactionFixture(
        '/examples/5',
        HttpMethods.POST,
        null,
        '400',
        CapturedBody.fromJSON({ error: 'an error message' }, 'text/json') // WHATWG-mimesniff  https://mimesniff.spec.whatwg.org/#mime-type-groups
      ),
      interactionFixture('/examples/4', HttpMethods.DELETE, null, '204', null),
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

function observationsOfKind<K extends UpdateObservationKind>(
  observations: UpdateObservation[],
  kind: K
): Array<UpdateObservation & { kind: K }> {
  return observations.filter<UpdateObservation & { kind: K }>(
    (observation): observation is UpdateObservation & { kind: K } => {
      return observation.kind === kind;
    }
  );
}
