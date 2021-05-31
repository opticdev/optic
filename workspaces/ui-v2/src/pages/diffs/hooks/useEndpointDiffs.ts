import { useSharedDiffContext } from '../contexts/SharedDiffContext';
import { EndpointDiffGrouping } from '../contexts/SharedDiffState';

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
