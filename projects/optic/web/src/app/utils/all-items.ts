import omit from 'lodash.omit';
import type {
  Changelog,
  ChangelogTree,
  OpticDiffs,
  WithOpticDiffs,
} from './changelog-tree';
import { od, or } from './changelog-tree';

export const addedOrChangedChangelog = <
  T extends object,
  K extends number | string,
>(
  diffs: OpticDiffs<T> | undefined,
  key: K
): Changelog<any> =>
  diffs
    ? (diffs as any).added?.[key] ?? (diffs as any).changed?.[key]
    : undefined;

export const anyChangelog = <T extends object, K extends keyof T | string>(
  diffs: OpticDiffs<T> | undefined,
  key: K
): Changelog<any> | undefined =>
  diffs
    ? (diffs as any).added?.[key] ??
      diffs.changed?.[key] ??
      diffs.removed?.[key]
    : undefined;

export const allChangelogs = <T extends object>(
  diffs: OpticDiffs<T> | undefined
): { key: string; change: Changelog<any> }[] => {
  const changes: { key: string; change: Changelog<any> }[] = [];
  for (const changeType of ['added', 'changed', 'removed'] as const) {
    const diffType = diffs?.[changeType];
    if (diffType) {
      for (const [key, change] of Object.entries(diffType)) {
        changes.push({ key, change: change as any });
      }
    }
  }
  return changes;
};

export const removedArrayChangelogs = <T>(items?: WithOpticDiffs<T[]>) => {
  if (!items) return undefined;
  return Object.values(items?.[od]?.removed ?? {});
};

export const arrayWithRemovedItems = <T>(
  items: WithOpticDiffs<T[]>
): WithOpticDiffs<T[]> => {
  const removedDiffs = items?.[od]?.removed ?? {};
  return [...items, ...Object.values(removedDiffs).map((v: any) => v.before)];
};

export const objectWithRemovedItems = <T extends object | undefined>(
  obj: WithOpticDiffs<T>
): WithOpticDiffs<T> => {
  if (!obj) return obj;
  const removedDiffs = obj?.[od]?.removed ?? {};

  const removedItems = Object.entries(removedDiffs).map(([k, c]) => [
    k,
    (c as any).before,
  ]);

  return {
    ...obj,
    ...Object.fromEntries(removedItems),
  };
};

export const objectPropWithChangelog = <P extends object, K extends keyof P>(
  parent: WithOpticDiffs<P>,
  key: K
): [P[K], Changelog<Required<P>[K]> | undefined] => {
  if (Array.isArray(parent))
    throw new Error(
      'This method cannot be used safely on arrays because a removed and an added items can share the same key'
    );
  const diffs = parent?.[od];
  const changelog =
    diffs?.added?.[key] ?? diffs?.changed?.[key] ?? diffs?.removed?.[key];
  const removed = changelog?.type === 'removed';
  const value = removed ? changelog.before : parent[key];
  return [value, changelog];
};

export const allUnreserved = <T extends object>(
  obj: T,
  reservedKeys: string[]
) => omit(objectWithRemovedItems(obj), [...reservedKeys, or]) ?? {};

export const mapChangelog = <T, V>(
  changelog: Changelog<T> | undefined,
  mapper: (t: T) => V
): Changelog<V> | undefined =>
  !changelog
    ? undefined
    : changelog?.type === 'added'
      ? changelog
      : {
          type: changelog.type,
          before: mapper(changelog.before),
        };

export const hasChanges = (obj: ChangelogTree<any> | undefined) =>
  obj?.[od]?.hasNestedChanges === true;
