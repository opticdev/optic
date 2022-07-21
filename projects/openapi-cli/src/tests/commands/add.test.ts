import { addOperations } from '../../commands/add';
import { OpenAPIV3, SpecPatches, SpecPatch } from '../../specs';
import { CapturedInteraction, CapturedBody } from '../../captures';
import { HttpMethods } from '../../operations';
import * as AT from '../../lib/async-tools';

describe('add command', () => {
  describe('add operations', () => {
    it('generates spec patches adding operation', async () => {
      let testSpec = specFixture({
        '/orders/{orderId}/products': {
          get: {
            responses: {},
          },
        },
      });

      const interactions = AT.from([]);

      const results = addOperations(
        testSpec,
        [
          { pathPattern: '/orders', methods: [HttpMethods.GET] },
          {
            pathPattern: '/products',
            methods: [HttpMethods.GET, HttpMethods.POST],
          },
          {
            pathPattern: '/orders/{orderId}/products', // existing path
            methods: [HttpMethods.POST], // new method
          },
        ],
        interactions
      );

      const specPatches = await resultingPatches(results);

      expect(specPatches.length).toBeGreaterThan(0);

      let updatedSpec = patchSpec(testSpec, specPatches);
      expect(updatedSpec).toMatchSnapshot();
    });

    it('does not add already matching operations', async () => {
      let testSpec = specFixture({
        '/orders/{orderId}/products': {
          get: {
            responses: {},
          },
        },
      });

      const interactions = AT.from([]);

      const results = addOperations(
        testSpec,
        [
          {
            pathPattern: '/orders/{orderId}/products',
            methods: [HttpMethods.GET],
          },
          {
            pathPattern: '/orders/{otherTemplateName}/products',
            methods: [HttpMethods.GET],
          },
          {
            pathPattern: '/orders/concrete-parameter/products',
            methods: [HttpMethods.GET],
          },
        ],
        interactions
      );

      const specPatches = await resultingPatches(results);

      expect(specPatches.length).toBe(0);
    });

    describe('with traffic', () => {
      it('generates patches adding requests, responses and bodies for matching traffic', async () => {
        let testSpec = specFixture({
          '/orders': {
            get: {
              responses: {},
            },
          },
        });

        const interactions = AT.from([
          // matching new operation
          interactionFixture(
            '/orders/3/products',
            HttpMethods.POST,
            CapturedBody.fromJSON(
              {
                name: 'some product',
                optionalField: true,
              },
              'application/json'
            ),
            201,
            CapturedBody.fromJSON(
              {
                id: 'product-1',
                name: 'some product',
                optionalField: true,
              },
              'application/json'
            )
          ),
          // matching new operation
          interactionFixture(
            '/orders/3/products',
            HttpMethods.POST,
            CapturedBody.fromJSON(
              {
                name: 'another product',
              },
              'application/json'
            ),
            201,
            CapturedBody.fromJSON(
              {
                id: 'product-2',
                name: 'some product',
              },
              'application/json'
            )
          ),
          // matching existing operation
          interactionFixture(
            '/orders',
            HttpMethods.GET,
            null,
            200,
            CapturedBody.fromJSON(
              [
                {
                  id: 'order-1',
                  status: 'pending',
                },
                {
                  id: 'order-2',
                  status: 'dispatched',
                },
              ],
              'application/json'
            )
          ),
        ]);

        const results = addOperations(
          testSpec,
          [
            {
              pathPattern: '/orders/{orderId}/products',
              methods: [HttpMethods.GET, HttpMethods.POST],
            },
          ],
          interactions
        );

        const specPatches = await resultingPatches(results);

        expect(specPatches.length).toBeGreaterThan(0);

        let updatedSpec = patchSpec(testSpec, specPatches);
        expect(updatedSpec).toMatchSnapshot();
      });
    });
  });
});

function specFixture(paths: OpenAPIV3.PathsObject = {}): OpenAPIV3.Document {
  return {
    openapi: '3.0.3',
    paths,
    info: { version: '0.0.0', title: 'Empty' },
  };
}

function patchSpec(spec, patches: SpecPatch[]) {
  let updatedSpec = spec;
  for (let patch of patches) {
    updatedSpec = SpecPatch.applyPatch(patch, updatedSpec);
  }
  return updatedSpec;
}

function interactionFixture(
  path: string,
  method: OpenAPIV3.HttpMethods,
  requestBody: CapturedBody | null = null,
  responseStatusCode: string | number = '200',
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
      statusCode: '' + responseStatusCode,
      body: responseBody,
    },
  };
}

async function resultingPatches<O>(result: {
  results: SpecPatches;
  observations: AsyncIterable<O>;
}): Promise<SpecPatch[]> {
  const patching = AT.collect(result.results);
  const observing = AT.count(result.observations);

  const [patches] = await Promise.all([patching, observing]);
  return patches;
}
