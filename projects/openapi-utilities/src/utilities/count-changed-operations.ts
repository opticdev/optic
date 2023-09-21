import { getEndpointDiffs, typeofV3Diffs } from '../openapi3/group-diff';
import { ChangeType } from '../openapi3/sdk/types';
import { GroupedDiffs } from '../openapi3/group-diff';

export const getLabel = (operationsModifsCount: {
  [ChangeType.Added]: number;
  [ChangeType.Changed]: number;
  [ChangeType.Removed]: number;
}) =>
  Object.keys(operationsModifsCount)
    .filter((k) => (operationsModifsCount as any)[k])
    .map(
      (key, ix) =>
        `${operationsModifsCount[key as ChangeType]} ${
          ix === 0
            ? operationsModifsCount[key as ChangeType] > 1
              ? 'operations '
              : 'operation '
            : ''
        }${key}`
    )
    .join(', ');

export const getOperationsChanged = (
  groupedDiffs: GroupedDiffs
): {
  added: Set<string>;
  changed: Set<string>;
  removed: Set<string>;
} => {
  const addedOps = new Set<string>();
  const changedOps = new Set<string>();
  const removedOps = new Set<string>();
  for (const endpoint of Object.values(groupedDiffs.endpoints)) {
    const id = `${endpoint.method.toUpperCase()} ${endpoint.path}`;
    const diffs = getEndpointDiffs(endpoint);
    const typeofDiffs = typeofV3Diffs(endpoint.diffs);
    if (typeofDiffs === 'added') {
      addedOps.add(id);
    } else if (typeofDiffs === 'removed') {
      removedOps.add(id);
    } else if (diffs.length > 0) {
      changedOps.add(id);
    }
  }

  return {
    added: addedOps,
    changed: changedOps,
    removed: removedOps,
  };
};

export const getOperationsChangedLabel = (
  groupedDiffs: GroupedDiffs
): string => {
  const { added, changed, removed } = getOperationsChanged(groupedDiffs);

  return getLabel({
    added: added.size,
    changed: changed.size,
    removed: removed.size,
  });
};
