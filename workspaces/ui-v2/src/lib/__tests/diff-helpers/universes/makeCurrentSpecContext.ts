import { CurrentSpecContext } from '../../../Interfaces';
import {
  AllEndpointsQuery,
  endpointQueryResultsToJson,
} from '../../../../optic-components/hooks/useEndpointsHook';
import { SpectacleInput } from '../../../../../../spectacle';
import {
  AllRequestsAndResponsesQuery,
  queryResultToAllRequestsResponses,
} from '../../../../optic-components/hooks/diffs/useAllRequestsAndResponses';

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
  };
}
