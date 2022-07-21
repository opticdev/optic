import {
  matchInteractions,
  StatusObservation,
  StatusObservationKind,
} from '../../commands/status';
import { CapturedInteraction, CapturedBody } from '../../captures';
import { OpenAPIV3 } from '../../specs';
import { HttpMethods } from '../../operations';
import * as AT from '../../lib/async-tools';

describe('status command', () => {
  describe('matching interactions', () => {
    let testSpec = specFixture({
      '/orders/{orderId}/products': {
        get: {
          responses: {},
        },
      },
      '/orders': {
        post: {
          responses: {},
        },
      },
    });

    it('observes matching operations', async () => {
      let interactions = AT.of(
        interactionFixture('/orders/3/products', HttpMethods.GET),
        interactionFixture('/orders', HttpMethods.POST)
      );

      const results = await AT.collect(
        matchInteractions(testSpec, interactions)
      );

      expect(results).toHaveLength(2);
      expect(
        results.every(
          ({ kind }) =>
            kind === StatusObservationKind.InteractionMatchedOperation
        )
      );
      expect(results).toMatchSnapshot();
    });

    it('observes unmatching paths', async () => {
      let interactions = AT.of(
        interactionFixture('/orders/3', HttpMethods.GET),
        interactionFixture('/orders/4/details', HttpMethods.GET),
        interactionFixture('/products', HttpMethods.POST)
      );

      const results = await AT.collect(
        matchInteractions(testSpec, interactions)
      );

      expect(results).toHaveLength(3);
      expect(
        results.every(
          ({ kind }) => kind === StatusObservationKind.InteractionUnmatchedPath
        )
      );
      expect(results).toMatchSnapshot();
    });

    it('observes unmatching methods', async () => {
      let interactions = AT.of(
        interactionFixture('/orders/3/products', HttpMethods.PATCH),
        interactionFixture('/orders', HttpMethods.GET)
      );

      const results = await AT.collect(
        matchInteractions(testSpec, interactions)
      );

      expect(results).toHaveLength(2);
      expect(
        results.every(
          ({ kind }) =>
            kind === StatusObservationKind.InteractionUnmatchedMethod
        )
      );
      expect(results).toMatchSnapshot();
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

function interactionFixture(
  path: string,
  method: OpenAPIV3.HttpMethods,
  requestBody: CapturedBody | null = null,
  responseStatusCode: number | string = '200',
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

function observationsOfKind<K extends StatusObservationKind>(
  observations: StatusObservation[],
  kind: K
): Array<StatusObservation & { kind: K }> {
  return observations.filter<StatusObservation & { kind: K }>(
    (observation): observation is StatusObservation & { kind: K } => {
      return observation.kind === kind;
    }
  );
}
