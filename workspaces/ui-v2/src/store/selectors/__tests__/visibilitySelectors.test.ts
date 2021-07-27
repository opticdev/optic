import { ChangeType } from '<src>/types';
import {
  isItemVisible,
  isItemVisibleForChangelog,
  filterRemovedItems,
  filterRemovedItemForChangelog,
  filterMapOfRemovedItems,
  filterMapOfRemovedItemsForChangelog,
} from '../visibilitySelectors';

describe('visibility selectors without changelog', () => {
  test('isItemVisible', () => {
    expect(isItemVisible({ isRemoved: false })).toBe(true);
    expect(isItemVisible({ isRemoved: true })).toBe(false);
  });

  test('filterRemovedItems', () => {
    const items = [
      {
        id: 1,
        isRemoved: false,
      },
      { id: 2, isRemoved: true },
    ];
    expect(filterRemovedItems(items)).toEqual([
      {
        id: 1,
        isRemoved: false,
      },
    ]);
  });

  test('filterMapOfRemovedItems', () => {
    const items = {
      goodStuff: [
        {
          id: 1,
          isRemoved: false,
        },
        { id: 2, isRemoved: true },
      ],
      keyShouldNotBeCopied: [{ id: 3, isRemoved: true }],
    };
    expect(filterMapOfRemovedItems(items)).toEqual({
      goodStuff: [
        {
          id: 1,
          isRemoved: false,
        },
      ],
    });
  });
});

describe('visibility selectors with changelog', () => {
  const getId = <T extends { id: string }>(item: T) => item.id;
  const changes: Record<string, ChangeType> = {
    has_changes: 'added',
  };

  test('isItemVisibleForChangelog', () => {
    expect(
      isItemVisibleForChangelog(
        { isRemoved: false, id: 'no_changes' },
        changes,
        getId
      )
    ).toBe(true);
    expect(
      isItemVisibleForChangelog(
        { isRemoved: false, id: 'has_changes' },
        changes,
        getId
      )
    ).toBe(true);
    expect(
      isItemVisibleForChangelog(
        { isRemoved: true, id: 'no_changes' },
        changes,
        getId
      )
    ).toBe(false);
    expect(
      isItemVisibleForChangelog(
        { isRemoved: true, id: 'has_changes' },
        changes,
        getId
      )
    ).toBe(true);
  });

  test('filterRemovedItemsForChangelog', () => {
    const items = [
      { isRemoved: true, id: 'no_changes' },
      { isRemoved: true, id: 'has_changes' },
      { isRemoved: false, id: '123' },
      { isRemoved: false, id: '456' },
    ];
    expect(filterRemovedItemForChangelog(items, changes, getId)).toEqual([
      { isRemoved: true, id: 'has_changes', changes: 'added' },
      { isRemoved: false, id: '123', changes: null },
      { isRemoved: false, id: '456', changes: null },
    ]);
  });

  test('filterMapOfRemovedItemsForChangelog', () => {
    const items = {
      goodStuff: [
        { isRemoved: true, id: 'no_changes' },
        { isRemoved: true, id: 'has_changes' },
        { isRemoved: false, id: '123' },
        { isRemoved: false, id: '456' },
      ],
      keyShouldNotBeCopied: [{ id: 'bad_id', isRemoved: true }],
    };
    expect(filterMapOfRemovedItemsForChangelog(items, changes, getId)).toEqual({
      goodStuff: [
        { isRemoved: true, id: 'has_changes', changes: 'added' },
        { isRemoved: false, id: '123', changes: null },
        { isRemoved: false, id: '456', changes: null },
      ],
    });
  });
});
