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
import { OperationDiffResultKind } from '../../../operations/diffs';

export function* missingPathPatches(
  undocumentedOperation: UndocumentedOperation
): IterableIterator<SpecPatch> {
  if (undocumentedOperation.type !== UndocumentedOperationType.MissingPath)
    return;

  yield createMissingPathPatches(undocumentedOperation);
}

export function createMissingPathPatches(
  undocumentedOperation: Extract<
    UndocumentedOperation,
    { type: UndocumentedOperationType.MissingPath }
  >
): SpecPatch {
  const { specPath, methods, pathPattern, pathParameters } =
    undocumentedOperation;

  let groupedOperations: PatchOperationGroup[] = [];

  groupedOperations.push(
    PatchOperationGroup.create(`add path with parameters`, {
      op: 'add',
      path: specPath,
      value: {},
    })
  );

  if (pathParameters.length > 0) {
    groupedOperations.push(
      PatchOperationGroup.create(`add path parameters`, {
        op: 'add',
        path: jsonPointerHelpers.append(specPath, 'parameters'),
        value: pathParameters.map(
          (parameterName): OpenAPIV3.ParameterObject => {
            return {
              in: 'path',
              name: parameterName,
              required: true,
              schema: {
                type: 'string',
              },
            };
          }
        ),
      })
    );
  }

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

  return {
    diff: {
      kind: OperationDiffResultKind.UnmatchedPath,
      subject: pathPattern,
    },
    path: jsonPointerHelpers.compile(['paths']),
    description: `add '${pathPattern}' and method${
      methods.length > 1 ? 's' : ''
    } ${methods.map((m) => m.toUpperCase()).join(', ')}`,
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    groupedOperations,
  };
}
