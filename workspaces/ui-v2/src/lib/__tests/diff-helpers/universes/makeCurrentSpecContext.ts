import { CurrentSpecContext } from '../../../Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
} from '../../../../optic-components/hooks/useEndpointsHook';
import { SpectacleInput } from '@useoptic/spectacle';
import {
  AllRequestsAndResponsesQuery,
  queryResultToAllRequestsResponses,
} from '../../../../optic-components/hooks/diffs/useAllRequestsAndResponses';
import { newDeterministicIdGenerator } from '../../../domain-id-generator';

export async function makeCurrentSpecContext(
  query: (spectacleInput: SpectacleInput) => Promise<any>
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

  return {
    currentSpecEndpoints: endpoints,
    currentSpecResponses: responses,
    currentSpecRequests: requests,
    domainIds: newDeterministicIdGenerator(),
  };
}
