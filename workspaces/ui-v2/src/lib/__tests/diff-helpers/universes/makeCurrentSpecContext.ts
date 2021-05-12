import { CurrentSpecContext } from '<src>/lib/Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
} from '<src>/optic-components/hooks/useEndpointsHook';
import { SpectacleInput } from '@useoptic/spectacle/build';
import {
  AllRequestsAndResponsesQuery,
  queryResultToAllRequestsResponses,
} from '<src>/optic-components/hooks/diffs/useAllRequestsAndResponses';
import { newDeterministicIdGenerator } from '<src>/lib/domain-id-generator';
import * as opticEngine from '@useoptic/diff-engine-wasm/engine/build';
import { AllPathsQuery } from '<src>/optic-components/hooks/usePathsHook';

export async function makeCurrentSpecContext(
  events: any[],
  query: (spectacleInput: SpectacleInput<any>) => Promise<any>
): Promise<CurrentSpecContext> {
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

  const { paths } = (
    await query({
      query: AllPathsQuery,
      variables: {},
    })
  ).data;

  return {
    currentSpecPaths: paths,
    currentSpecEndpoints: endpoints,
    currentSpecResponses: responses,
    currentSpecRequests: requests,
    domainIds: newDeterministicIdGenerator(),
    idGeneratorStrategy: 'sequential',
    opticEngine,
  };
}
