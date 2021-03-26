import { useSharedDiffContext } from './SharedDiffContext';

type IDiffsByHash = { [key: string]: {} };

export function useEndpointDiffs(pathId: string, method: string): IDiffsByHash {
  const diffState = useSharedDiffContext();
  const diffHashes =
    diffState.context.results.diffHashesByEndpoints[`${method}.${pathId}`] ||
    [];

  const results: IDiffsByHash = {};
  diffHashes.forEach((i) => (results[i] = {}));
  return results;
}
