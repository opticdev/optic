import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OPTIC_PATH_IGNORE_KEY } from '../../../../constants';
import { Operation } from 'fast-json-patch';

import {
  PatchImpact,
  PatchOperation,
  PatchOperationGroup,
} from '../../../oas/patches';
import { SpecPatch } from '../../../oas/specs';
import {
  UndocumentedOperation,
  UndocumentedOperationType,
} from '../../../oas/operations';
import { OperationDiffResultKind } from '../../../oas/operations/diffs';

export function getIgnorePathPatch(
  spec: OpenAPIV3.Document,
  ignorePaths: (string | { method: string; path: string })[]
): SpecPatch {
  const hasExistingIgnorePaths = Array.isArray(spec[OPTIC_PATH_IGNORE_KEY]);
  const operations: Operation[] = [];
  const basePath = jsonPointerHelpers.compile([OPTIC_PATH_IGNORE_KEY]);

  if (!hasExistingIgnorePaths) {
    operations.push({
      op: 'replace',
      path: basePath,
      value: [],
    });
  }

  for (const path of ignorePaths) {
    operations.push({
      op: 'add',
      path: jsonPointerHelpers.compile([OPTIC_PATH_IGNORE_KEY, '-']),
      value: path,
    });
  }

  return {
    description: 'add x-optic-path-ignore values',
    diff: undefined,
    impact: [PatchImpact.Addition],
    groupedOperations: [
      {
        intent: 'add ignore paths to optic',
        operations,
      },
    ],
    path: basePath,
  };
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
