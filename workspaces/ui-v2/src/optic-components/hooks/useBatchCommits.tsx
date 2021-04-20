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

  if (error) {
    debugger;
  }

  return useMemo(() => {
    if (!data) {
      return [];
    }

    return data.batchCommits.map((i: any) => ({
      commitMessage: i.commitMessage,
      batchId: i.batchId,
      createdAt: i.createdAt,
    }));
  }, [data]);
}

export function useLastBatchCommitId(): string | undefined {
  //@todo should be use batch commit of Diff -- usually equal
  const commits = useBatchCommits();
  if (commits) {
    if (commits.length === 0) {
      return '';
    } else {
      return commits[0]?.batchId;
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
