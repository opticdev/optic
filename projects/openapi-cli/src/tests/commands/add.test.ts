import { addOperations } from '../../commands/add';
import { OpenAPIV3, SpecPatches, SpecPatch } from '../../specs';
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

async function resultingPatches<O>(result: {
  results: SpecPatches;
  observations: AsyncIterable<O>;
}): Promise<SpecPatch[]> {
  const patching = AT.collect(result.results);
  const observing = AT.count(result.observations);

  const [patches] = await Promise.all([patching, observing]);
  return patches;
}
