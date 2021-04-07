import { useSharedDiffContext } from './SharedDiffContext';
import { EndpointDiffGrouping } from './SharedDiffState';

export function useEndpointDiffs(
  pathId: string,
  method: string
): EndpointDiffGrouping {
  const diffState = useSharedDiffContext();

  const endpoint = diffState.context.results.diffsGroupedByEndpoint.find(
    (i) => i.pathId === pathId && i.method === method
  )!;

  return endpoint;
}
