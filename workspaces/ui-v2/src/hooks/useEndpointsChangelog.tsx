import { useSpectacleQuery } from '<src>/contexts/spectacle-provider';

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

type ChangelogCategory = 'added' | 'updated' | 'removed';

export type EndpointChangelog = {
  change: {
    category: ChangelogCategory;
  };
  pathId: string;
  method: string;
};

type EndpointChangeQueryResults = {
  endpointChanges: {
    endpoints: EndpointChangelog[];
  };
};

type EndpointChangeQueryInput = {
  sinceBatchCommitId?: string;
};

export function useEndpointsChangelog(
  sinceBatchCommitId?: string
): EndpointChangelog[] {
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
