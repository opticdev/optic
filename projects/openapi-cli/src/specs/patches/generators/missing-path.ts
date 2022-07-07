import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../operations';
import { SpecPatch, OpenAPIV3 } from '../..';
import {
  PatchOperationGroup,
  PatchImpact,
  PatchOperation,
} from '../../../patches';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* missingPathPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingPath)
    return;

  const { specPath, methods, pathPattern } = undocumentedOperation;

  let groupedOperations: PatchOperationGroup[] = [];

  groupedOperations.push(
    PatchOperationGroup.create(`add path`, {
      op: 'add',
      path: specPath,
      value: {},
    })
  );

  let methodOperations: PatchOperation[] = methods.map((method) => ({
    op: 'add',
    path: jsonPointerHelpers.append(specPath, method),
    value: {
      responses: {},
    },
  }));

  groupedOperations.push(
    PatchOperationGroup.create('add methods', ...methodOperations)
  );

  yield {
    description: `add '${pathPattern}' and method${
      methods.length > 1 ? 's' : ''
    } ${methods.map((m) => m.toUpperCase()).join(', ')}`,
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    groupedOperations,
  };
}
