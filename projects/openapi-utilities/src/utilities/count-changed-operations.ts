import { isChangeVariant } from '../openapi3/sdk/isType';
import { OpenApiKind, IChange, ChangeType } from '../openapi3/sdk/types';

const countOperationsModifications = (changes: IChange[]) => {
  const operations = {
    [ChangeType.Added]: new Set(),
    [ChangeType.Changed]: new Set(),
    [ChangeType.Removed]: new Set(),
  };

  for (const change of changes) {
    if (isChangeVariant(change, OpenApiKind.Specification)) continue;
    const path = (change.location.conceptualLocation as any).path;
    const method = (change.location.conceptualLocation as any).method;
    if (!path || !method) continue;
    const operationId = `${path}.${method}`;
    operations[change.changeType].add(operationId);
  }

  return {
    [ChangeType.Added]: operations[ChangeType.Added].size,
    [ChangeType.Changed]: operations[ChangeType.Changed].size,
    [ChangeType.Removed]: operations[ChangeType.Removed].size,
  };
};

const getLabel = (
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
