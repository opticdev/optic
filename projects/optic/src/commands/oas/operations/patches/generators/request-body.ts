import { OperationDiffResult, OperationDiffResultKind } from '../../diffs';
import { OperationPatch, PatchOperationGroup, PatchImpact } from '..';
import { Operation } from '../..';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function* requestBodyPatches(
  diff: OperationDiffResult,
  operation: Operation,
  context?: {
    statusCode: string;
  }
): IterableIterator<OperationPatch> {
  if (context) {
    let numericalStatusCode = parseInt(context.statusCode, 10);
    if (numericalStatusCode < 200 || numericalStatusCode >= 400) {
      return; // only patch 2xx and 3xx status codes
    }
  }

  if (diff.kind === OperationDiffResultKind.MissingRequestBody) {
    yield* missingRequestBodyPatches(diff);
  } else if (diff.kind === OperationDiffResultKind.UnmatchedRequestBody) {
    yield* unmatchedRequestBodyPatches(diff, operation);
  }
}

function* missingRequestBodyPatches(
  diff: OperationDiffResult
): IterableIterator<OperationPatch> {
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
    diff,
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
      value: {
        schema: {},
      },
    })
  );

  yield {
    description: `add '${contentType}' body as a valid request body type`,
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    diff,
    groupedOperations,
  };
}
