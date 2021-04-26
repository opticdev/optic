import {
  SpectacleContext,
  useSpectacleQuery,
} from '../../spectacle-implementations/spectacle-provider';
import { useContext, useEffect, useMemo, useState } from 'react';

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
  const spectacle = useContext(SpectacleContext)!;

  const [result, setResult] = useState<any[]>([]);

  useEffect(() => {
    async function task() {
      const result = await spectacle.query({
        query: endpointChangeQuery,
        variables: {
          sinceBatchCommitId,
        },
      });

      console.log('rerunning with', sinceBatchCommitId);
      if (result.errors) {
        console.error(result.errors);
        result.error = new Error(result.errors);
      }
      setResult(result);
    }

    task();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinceBatchCommitId, spectacle]);

  return result;
}
