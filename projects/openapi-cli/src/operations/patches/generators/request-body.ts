import { OperationDiffResult, OperationDiffResultKind } from '../../diffs';
import { OperationPatch, PatchOperationGroup, PatchImpact } from '..';
import { Operation } from '../..';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* requestBodyPatches(
  diff: OperationDiffResult,
  operation: Operation,
  context?: {}
): IterableIterator<OperationPatch> {
  if (diff.kind === OperationDiffResultKind.MissingRequestBody) {
    yield* missingRequestBodyPatches();
  } else if (diff.kind === OperationDiffResultKind.UnmatchedRequestBody) {
    yield* unmatchedRequestBodyPatches(diff, operation);
  }
}

function* missingRequestBodyPatches(): IterableIterator<OperationPatch> {
  const operationGroup = PatchOperationGroup.create(
    'make request body optional',
    {
      op: 'replace',
      path: jsonPointerHelpers.compile(['requestBody', 'required']),
      value: false,
    }
  );

  yield {
    description: 'make request body optional',
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    groupedOperations: [operationGroup],
  };
}

function* unmatchedRequestBodyPatches(
  diff: OperationDiffResult & {
    kind: OperationDiffResultKind.UnmatchedRequestBody;
  },
  operation: Operation
): IterableIterator<OperationPatch> {
  const requestBody = operation.requestBody;

  if (!diff.contentType) return; // we can't add a content type if it's unknown
  const contentType = diff.contentType;

  let groupedOperations: PatchOperationGroup[] = [];
  if (!requestBody) {
    groupedOperations.push(
      PatchOperationGroup.create(`add request body to operation`, {
        op: 'add',
        path: jsonPointerHelpers.compile(['requestBody']),
        value: {
          content: {},
        },
      })
    );
  }

  groupedOperations.push(
    PatchOperationGroup.create(`add ${contentType} as content type`, {
      op: 'add',
      path: jsonPointerHelpers.compile(['requestBody', 'content', contentType]),
      value: {},
    })
  );

  yield {
    description: `add body for content type '${contentType}' as a valid request body type`,
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    groupedOperations,
  };
}
