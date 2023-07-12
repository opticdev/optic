import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../operations';
import { SpecPatch } from '../..';
import { PatchOperationGroup, PatchImpact } from '../../../patches';
import { OperationDiffResultKind } from '../../../operations/diffs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* missingMethodPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingMethod)
    return;

  yield createMissingMethodPatch(undocumentedOperation);
}

export function createMissingMethodPatch(
  undocumentedOperation: Extract<
    UndocumentedOperation,
    { type: UndocumentedOperationType.MissingMethod }
  >
): SpecPatch {
  const { specPath, method, pathPattern } = undocumentedOperation;

  let groupedOperations: PatchOperationGroup[] = [];

  groupedOperations.push(
    PatchOperationGroup.create(`add method`, {
      op: 'add',
      path: specPath,
      value: {
        responses: {},
      },
    })
  );

  return {
    diff: {
      kind: OperationDiffResultKind.UnmatchedMethod,
      subject: method,
      pathPattern: pathPattern,
    },
    path: jsonPointerHelpers.compile(['paths', pathPattern]),
    description: `add '${method.toUpperCase()}' method for '${pathPattern}'`,
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    groupedOperations,
  };
}
