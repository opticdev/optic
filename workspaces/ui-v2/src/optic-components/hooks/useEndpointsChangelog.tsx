import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';
import { useMemo } from 'react';

//@todo not working as expected -- never any changes
export const endpointChangeQuery = `query X($sinceBatchCommitId: String) {
    endpointChanges(sinceBatchCommitId: $sinceBatchCommitId) {
      endpoints {
        change {
          category
        }
        path
        method
      }
    }
}`;

export function useEndpointsChangelog(sinceBatchCommitId?: string): any[] {
  const { data, error } = useSpectacleQuery({
    query: endpointChangeQuery,
    variables: {
      sinceBatchCommitId,
    },
  });

  if (error) {
    debugger;
  }

  return useMemo(() => {
    if (!data) {
      return [];
    }
    return [];
  }, [data]);
}
