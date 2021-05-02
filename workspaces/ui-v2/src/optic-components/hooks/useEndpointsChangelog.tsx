import { SpectacleContext } from '../../spectacle-implementations/spectacle-provider';
import { useContext, useEffect, useState } from 'react';

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

export function useEndpointsChangelog(sinceBatchCommitId?: string): any[] {
  const spectacle = useContext(SpectacleContext)!;

  const [result, setResult] = useState<any[]>([]);

  useEffect(() => {
    async function task() {
      if (!sinceBatchCommitId) {
        setResult([]);
        return;
      }

      const result = await spectacle.query({
        query: endpointChangeQuery,
        variables: {
          sinceBatchCommitId,
        },
      });

      if (result.data) {
        setResult(result.data.endpointChanges.endpoints);
      }

      if (result.errors) {
        console.error(result.errors);
        result.error = new Error(result.errors);
      }
    }

    task();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinceBatchCommitId, spectacle]);

  return result;
}
