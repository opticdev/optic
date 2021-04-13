import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';
import { useMemo } from 'react';

export const BatchCommitsQuery = `{
    batchCommits {
      createdAt
      commitMessage
      batchId
    }
}`;

export function useBatchCommits(): BatchCommit[] {
  const { data, error } = useSpectacleQuery({
    query: BatchCommitsQuery,
    variables: {},
  });

  return useMemo(() => {
    if (!data) {
      return [];
    }

    return data.batchCommits.map((i: any) => ({
      commitMessage: i.commitMessage,
      batchId: i.batchId,
      createdAt: i.createdAt,
    }));
  }, [data, data && data.batchCommits.length]);
}

export interface BatchCommit {
  commitMessage: string;
  batchId: string;
  createdAt: string;
}
