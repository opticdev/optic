import { typeofV3Diffs } from '../openapi3/group-diff';
import { isChangeVariant } from '../openapi3/sdk/isType';
import { OpenApiKind, IChange, ChangeType } from '../openapi3/sdk/types';
import { GroupedDiffs } from '../openapi3/group-diff';

const getChangeOperationId = (change: IChange) => {
  const path = (change.location.conceptualLocation as any).path;
  const method = (change.location.conceptualLocation as any).method;
  if (!path || !method) return null;
  return `${path}.${method}`;
};

export const countOperationsModifications = (changes: IChange[]) => {
  const operationsChanges = changes.filter((c) =>
    isChangeVariant(c, OpenApiKind.Operation)
  );

  const operationsAdded = operationsChanges.filter(
    (c) => c.changeType === ChangeType.Added
  );
  const operationsRemoved = operationsChanges.filter(
    (c) => c.changeType === ChangeType.Removed
  );
  const operationsChanged = operationsChanges.filter(
    (c) => c.changeType === ChangeType.Changed
  );

  const operationsByChange = {
    [ChangeType.Added]: new Set(
      operationsAdded.map(getChangeOperationId).filter((id) => !!id)
    ),
    [ChangeType.Changed]: new Set(
      operationsChanged.map(getChangeOperationId).filter((id) => !!id)
    ),
    [ChangeType.Removed]: new Set(
      operationsRemoved.map(getChangeOperationId).filter((id) => !!id)
    ),
  };

  const operationWasAddedOrRemoved = (operationId: string) =>
    operationsByChange.added.has(operationId) ||
    operationsByChange.removed.has(operationId);

  for (const change of changes) {
    const operationId = getChangeOperationId(change);
    if (!operationId || operationWasAddedOrRemoved(operationId)) continue;
    operationsByChange.changed.add(operationId);
  }

  return {
    [ChangeType.Added]: operationsByChange[ChangeType.Added].size,
    [ChangeType.Changed]: operationsByChange[ChangeType.Changed].size,
    [ChangeType.Removed]: operationsByChange[ChangeType.Removed].size,
  };
};

export const getLabel = (
  operationsModifsCount: ReturnType<typeof countOperationsModifications>
) =>
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

export const getOperationsModifsLabel = (changes: IChange[]) =>
  getLabel(countOperationsModifications(changes));

export const getOperationsChangedLabel = (
  groupedDiffs: GroupedDiffs
): string => {
  const addedOps = new Set();
  const changedOps = new Set();
  const removedOps = new Set();
  for (const endpoint of Object.values(groupedDiffs.endpoints)) {
    const id = `${endpoint.path}${endpoint.method}`;
    const typeofDiffs = typeofV3Diffs(endpoint.diffs);
    if (typeofDiffs === 'added') {
      addedOps.add(id);
    } else if (typeofDiffs === 'removed') {
      removedOps.add(id);
    } else {
      changedOps.add(id);
    }
  }

  return getLabel({
    added: addedOps.size,
    changed: changedOps.size,
    removed: removedOps.size,
  });
};
