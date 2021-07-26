import {
  IEndpoint,
  IEndpointWithChanges,
  ChangeType,
  IResponse,
} from '<src>/types';
import { getEndpointId } from '<src>/utils';

import { RootState } from '../root';

const filterRemovedItems = <T extends { isRemoved: boolean }>(
  removableItems: T[]
): T[] => removableItems.filter((removableItem) => !removableItem.isRemoved);

const filterRemovableItemsForChangelogAndMapChanges = <
  T extends { isRemoved: boolean }
>(
  removableItems: T[],
  changes: Record<string, ChangeType>,
  getId: (item: T) => string
): (T & { changes: ChangeType | null })[] => {
  // Filter removed endpoints that have no changes to display
  const filteredItems = removableItems.filter((item) => {
    const itemId = getId(item);

    // Assumption - if an endpoint is removed, but this batch of changes contains _any_ change for this endpoint
    // we should show this endpoint - the last change you could make is a removal
    // Two assumptions:
    // - You cannot un-remove a specific endpoint (with history, you can undo batches)
    // - You must always view changes compared to the latest version
    return !(item.isRemoved && !changes[itemId]);
  });

  const itemsWithChanges = filteredItems.map((item) => ({
    ...item,
    changes: changes[getId(item)] || null,
  }));

  return itemsWithChanges;
};

export const filterRemovedEndpoints = (endpoints: IEndpoint[]): IEndpoint[] =>
  filterRemovedItems(endpoints);

/**
 * Filters removed endpoints not removed in changes and joins changelog information
 */
export const filterRemovedEndpointsForChangelogAndMapChanges = (
  endpoints: IEndpoint[],
  endpointChanges: Record<string, ChangeType>
): IEndpointWithChanges[] => {
  return filterRemovableItemsForChangelogAndMapChanges(
    endpoints,
    endpointChanges,
    (endpoint) => getEndpointId(endpoint)
  );
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
