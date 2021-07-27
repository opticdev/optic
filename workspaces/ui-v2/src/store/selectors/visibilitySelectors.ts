import { ChangeType } from '<src>/types';

export const isItemVisible = <T extends { isRemoved: boolean }>(
  item: T
): boolean => {
  return !item.isRemoved;
};

export const isItemVisibleForChangelog = <T extends { isRemoved: boolean }>(
  item: T,
  changes: Record<string, ChangeType>,
  getId: (item: T) => string
): boolean => {
  const itemId = getId(item);

  // Assumption - if an item is removed, but this batch of changes contains _any_ change for this item
  // we should show this item - the last change you could make is a removal
  // Two assumptions:
  // - You cannot un-remove a specific item (with history, you can undo batches)
  // - You must always view changes compared to the latest version
  return !(item.isRemoved && !changes[itemId]);
};

export const filterRemovedItems = <T extends { isRemoved: boolean }>(
  removableItems: T[]
): T[] => removableItems.filter(isItemVisible);

export const filterRemovedItemForChangelog = <T extends { isRemoved: boolean }>(
  removableItems: T[],
  changes: Record<string, ChangeType>,
  getId: (item: T) => string
): (T & { changes: ChangeType | null })[] => {
  // Filter removed items that have no changes to display
  const filteredItems = removableItems.filter((item) =>
    isItemVisibleForChangelog(item, changes, getId)
  );

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

export const filterMapOfRemovedItemsForChangelog = <
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
    const filteredItems = filterRemovedItemForChangelog(
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
