import { useSpectacleQuery } from '<src>/spectacle-implementations/spectacle-provider';

//@todo not working as expected -- never any changes
export const endpointChangeQuery = `query X($sinceBatchCommitId: String) {
    endpointChanges(sinceBatchCommitId: $sinceBatchCommitId) {
      endpoints {
        change {
          category
        }
        pathId
        method
      }
    }
}`;

type Endpoints = any[];

type EndpointChangeQueryResults = {
  endpointChanges: {
    endpoints: Endpoints;
  };
};

type EndpointChangeQueryInput = {
  sinceBatchCommitId?: string;
};

export function useEndpointsChangelog(sinceBatchCommitId?: string): Endpoints {
  const queryResults = useSpectacleQuery<
    EndpointChangeQueryResults,
    EndpointChangeQueryInput
  >({
    query: endpointChangeQuery,
    variables: {
      sinceBatchCommitId,
    },
  });

  return queryResults.data?.endpointChanges.endpoints || [];
}
