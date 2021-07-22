import {
  IEndpoint,
  IEndpointWithChanges,
  ChangeType,
  IResponse,
} from '<src>/types';
import { getEndpointId } from '<src>/utils';

import { RootState } from '../root';

export const filterRemovedEndpoints = (endpoints: IEndpoint[]): IEndpoint[] =>
  endpoints.filter((endpoint) => !endpoint.isRemoved);

/**
 * Filters removed endpoints not removed in changes and joins changelog information
 */
export const filterRemovedEndpointsForChangelogAndMapChanges = (
  endpoints: IEndpoint[],
  endpointChanges: Record<string, ChangeType>
): IEndpointWithChanges[] => {
  // Filter removed endpoints that have no changes to display
  const filteredEndpoints = endpoints.filter((endpoint) => {
    const endpointId = getEndpointId(endpoint);

    // Assumption - if an endpoint is removed, but this batch of changes contains _any_ change for this endpoint
    // we should show this endpoint - the last change you could make is a removal
    // Two assumptions:
    // - You cannot un-remove a specific endpoint (with history, you can undo batches)
    // - You must always view changes compared to the latest version
    return !(endpoint.isRemoved && !endpointChanges[endpointId]);
  });

  const endpointsWithChanges = filteredEndpoints.map((endpoint) => ({
    ...endpoint,
    changes: endpointChanges[getEndpointId(endpoint)] || null,
  }));

  return endpointsWithChanges;
};

export const getEndpoint = ({
  pathId,
  method,
}: {
  pathId: string;
  method: string;
}) => (state: RootState) => {
  const endpointId = getEndpointId({ pathId, method });

  return state.endpoints.results.data?.endpoints.find(
    (endpoint) => getEndpointId(endpoint) === endpointId
  );
};

export const getResponsesInSortedOrder = (
  responses: IEndpoint['responsesByStatusCode']
): [string, IResponse[]][] => {
  return Object.entries(responses).sort(
    ([statusCode1], [statusCode2]) => Number(statusCode1) - Number(statusCode2)
  );
};
