import { IEndpoint, ChangeType, IResponse } from '<src>/types';
import { getEndpointId } from '<src>/utils';

import { RootState } from '../root';

export const filterRemovedItems = <T extends { isRemoved: boolean }>(
  removableItems: T[]
): T[] => removableItems.filter((removableItem) => !removableItem.isRemoved);

export const filterRemovableItemsForChangelogAndMapChanges = <
  T extends { isRemoved: boolean }
>(
  removableItems: T[],
  changes: Record<string, ChangeType>,
  getId: (item: T) => string
): (T & { changes: ChangeType | null })[] => {
  // Filter removed items that have no changes to display
  const filteredItems = removableItems.filter((item) => {
    const itemId = getId(item);

    // Assumption - if an item is removed, but this batch of changes contains _any_ change for this item
    // we should show this item - the last change you could make is a removal
    // Two assumptions:
    // - You cannot un-remove a specific item (with history, you can undo batches)
    // - You must always view changes compared to the latest version
    return !(item.isRemoved && !changes[itemId]);
  });

  const itemsWithChanges = filteredItems.map((item) => ({
    ...item,
    changes: changes[getId(item)] || null,
  }));

  return itemsWithChanges;
};

export const filterMapOfRemovedItems = <T extends { isRemoved: boolean }>(
  removableItemsMap: Record<string, T[]>
): Record<string, T[]> => {
  const filteredMap: Record<string, T[]> = {};
  for (const [key, removableItems] of Object.entries(removableItemsMap)) {
    const filteredItems = filterRemovedItems(removableItems);
    if (filteredItems.length > 0) {
      filteredMap[key] = filteredItems;
    }
  }
  return filteredMap;
};

export const filterMapOfRemovableItemsForChangelogAndMapChanges = <
  T extends { isRemoved: boolean }
>(
  removableItemsMap: Record<string, T[]>,
  changes: Record<string, ChangeType>,
  getId: (item: T) => string
): Record<string, (T & { changes: ChangeType | null })[]> => {
  const filteredMap: Record<
    string,
    (T & { changes: ChangeType | null })[]
  > = {};
  for (const [key, removableItems] of Object.entries(removableItemsMap)) {
    const filteredItems = filterRemovableItemsForChangelogAndMapChanges(
      removableItems,
      changes,
      getId
    );
    if (filteredItems.length > 0) {
      filteredMap[key] = filteredItems;
    }
  }
  return filteredMap;
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
