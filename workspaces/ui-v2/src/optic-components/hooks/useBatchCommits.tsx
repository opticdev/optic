import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';
import { useMemo } from 'react';

export const BatchCommitsQuery = `{
    batchCommits {
      createdAt
      commitMessage
      batchId
    }
}`;

export function useBatchCommits(): {
  loading: boolean;
  batchCommits: BatchCommit[];
} {
  const { data, loading, error } = useSpectacleQuery({
    query: BatchCommitsQuery,
    variables: {},
  });

  if (error) {
    debugger;
  }

  const batchCommits = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.batchCommits
      .map((i: any) => ({
        commitMessage: i.commitMessage,
        batchId: i.batchId,
        createdAt: i.createdAt,
      }))
      .reverse();
  }, [data]);

  return { loading, batchCommits };
}

export function useLastBatchCommitId(): string | undefined {
  //@todo should be use batch commit of Diff -- usually equal
  const commits = useBatchCommits();
  if (commits) {
    if (commits.batchCommits.length === 0 && !commits.loading) {
      return '';
    } else if (commits.batchCommits.length > 0) {
      return commits.batchCommits[0].batchId;
    }
  } else {
    return undefined;
  }
}

export interface BatchCommit {
  commitMessage: string;
  batchId: string;
  createdAt: string;
}
