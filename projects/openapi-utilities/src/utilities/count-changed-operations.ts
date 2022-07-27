import { isChangeVariant } from '../openapi3/sdk/isType';
import { OpenApiKind, IChange } from '../openapi3/sdk/types';

export const countChangedOperations = (changes: IChange[]) => {
  const operations = new Set();
  for (const change of changes) {
    if (isChangeVariant(change, OpenApiKind.Specification)) continue;
    const path = (change.location.conceptualLocation as any).path;
    const method = (change.location.conceptualLocation as any).method;
    if (!path || !method) continue;
    const operationId = `${path}.${method}`;
    operations.add(operationId);
  }
  return operations.size;
};
