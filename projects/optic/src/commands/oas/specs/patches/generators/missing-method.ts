import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../operations';
import { SpecPatch, OpenAPIV3 } from '../..';
import { PatchOperationGroup, PatchImpact } from '../../../patches';
import { OperationDiffResultKind } from '../../../operations/diffs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* missingMethodPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingMethod)
    return;

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

  yield {
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
