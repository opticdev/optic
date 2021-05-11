import { CurrentSpecContext } from '../../../Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
} from '../../../../optic-components/hooks/useEndpointsHook';
import { SpectacleInput } from '@useoptic/spectacle/build';
import {
  AllRequestsAndResponsesQuery,
  queryResultToAllRequestsResponses,
} from '../../../../optic-components/hooks/diffs/useAllRequestsAndResponses';
import { newDeterministicIdGenerator } from '../../../domain-id-generator';
import { makeSpectacle } from '@useoptic/spectacle';
import * as opticEngine from '@useoptic/diff-engine-wasm/engine/build';
import {
  InMemoryOpticContextBuilder,
  InMemorySpectacle,
} from '@useoptic/spectacle/build/in-memory';

export async function makeCurrentSpecContext(
  events: any[],
  query: (spectacleInput: SpectacleInput<any>) => Promise<any>
): Promise<CurrentSpecContext> {
  const opticContext = await InMemoryOpticContextBuilder.fromEventsAndInteractions(
    opticEngine,
    events,
    [],
    'example-session'
  );
  const inMemorySpectacle = new InMemorySpectacle(opticContext, []);

  const endpoints = endpointQueryResultsToJson(
    (
      await query({
        query: AllEndpointsQuery,
        variables: {},
      })
    ).data
  );

  const { requests, responses } = queryResultToAllRequestsResponses(
    (
      await query({
        query: AllRequestsAndResponsesQuery,
        variables: {},
      })
    ).data
  );

  return {
    currentSpecPaths: [],
    currentSpecEndpoints: endpoints,
    currentSpecResponses: responses,
    currentSpecRequests: requests,
    domainIds: newDeterministicIdGenerator(),
    opticEngine,
  };
}
