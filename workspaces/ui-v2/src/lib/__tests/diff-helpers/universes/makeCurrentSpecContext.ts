import { CurrentSpecContext } from '<src>/lib/Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
  EndpointQueryResults,
} from '<src>/optic-components/hooks/useEndpointsHook';
import { IBaseSpectacle } from '@useoptic/spectacle';
import {
  AllRequestsAndResponsesQuery,
  queryResultToAllRequestsResponses,
} from '<src>/optic-components/hooks/diffs/useAllRequestsAndResponses';
import { newDeterministicIdGenerator } from '<src>/lib/domain-id-generator';
import * as opticEngine from '@useoptic/diff-engine-wasm/engine/build';
import {
  AllPathsQuery,
  PathQueryResponse,
} from '<src>/optic-components/hooks/usePathsHook';

export async function makeCurrentSpecContext(
  events: any[],
  query: IBaseSpectacle['query']
): Promise<CurrentSpecContext> {
  const endpoints = endpointQueryResultsToJson(
    (
      await query<EndpointQueryResults>({
        query: AllEndpointsQuery,
        variables: {},
      })
    ).data || {
      requests: [],
    },
    []
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
    await query<PathQueryResponse>({
      query: AllPathsQuery,
      variables: {},
    })
  ).data || { paths: [] };

  return {
    currentSpecPaths: paths,
    currentSpecEndpoints: endpoints,
    currentSpecResponses: responses,
    currentSpecRequests: requests,
    domainIds: newDeterministicIdGenerator(),
    idGeneratorStrategy: 'random',
    opticEngine,
  };
}
