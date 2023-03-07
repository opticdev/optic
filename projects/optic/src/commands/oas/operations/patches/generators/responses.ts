import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OperationPatch } from '..';
import { Operation } from '../..';
import { PatchOperationGroup, PatchImpact } from '../../../patches';
import { OperationDiffResult, OperationDiffResultKind } from '../../diffs';
import { OpenAPIV3 } from '../../../specs';

export function* responsesPatches(
  diff: OperationDiffResult,
  operation: Operation,
  context?: {}
): IterableIterator<OperationPatch> {
  if (diff.kind === OperationDiffResultKind.UnmatchedResponseStatusCode) {
    yield* unmatchedStatusCode(diff, operation);
  } else if (diff.kind === OperationDiffResultKind.UnmatchedResponseBody) {
    yield* unmatchedResponseBody(diff, operation);
  } else if (diff.kind === OperationDiffResultKind.MissingResponseBody) {
    yield* missingResponseBody(diff, operation);
  }
}

function* unmatchedStatusCode(
  diff: OperationDiffResult & {
    kind: OperationDiffResultKind.UnmatchedResponseStatusCode;
  },
  _operation: Operation
): IterableIterator<OperationPatch> {
  let groupedOperations: PatchOperationGroup[] = [];

  const { statusCode, contentType } = diff;

  const numericalStatusCode = parseInt(statusCode, 10);
  if (
    numericalStatusCode < 200 ||
    numericalStatusCode >= 500 ||
    (numericalStatusCode >= 300 && numericalStatusCode < 400)
  ) {
    return; // only document 2xx and 4xx
  }

  const responseObject: OpenAPIV3.ResponseObject = {
    description: `${statusCode} response`, // required, no longer in v3.1
  };
  groupedOperations.push(
    PatchOperationGroup.create('add response status code', {
      op: 'add',
      path: jsonPointerHelpers.compile(['responses', statusCode]),
      value: responseObject,
    })
  );

  const mediaTypeObject: OpenAPIV3.MediaTypeObject = {};
  if (contentType) {
    groupedOperations.push(
      PatchOperationGroup.create(
        `add response body for content type '${contentType}'`,
        {
          op: 'add',
          path: jsonPointerHelpers.compile([
            'responses',
            statusCode,
            'content',
          ]),
          value: {
            [contentType]: mediaTypeObject,
          },
        }
      )
    );
  }

  yield {
    description: `add ${statusCode} response`,
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    diff,
    groupedOperations,
  };
}

function* unmatchedResponseBody(
  diff: OperationDiffResult & {
    kind: OperationDiffResultKind.UnmatchedResponseBody;
  },
  operation: Operation
): IterableIterator<OperationPatch> {
  const { statusCode, contentType } = diff;
  const response = operation.responses[statusCode] as OpenAPIV3.ResponseObject;

  if (!contentType) return; // we can't add undefined content types

  const groupedOperations: PatchOperationGroup[] = [];

  if (!response.content) {
    groupedOperations.push(
      PatchOperationGroup.create(
        `add content object for ${statusCode} response`,
        {
          op: 'add',
          path: jsonPointerHelpers.compile([
            'responses',
            statusCode,
            'content',
          ]),
          value: {},
        }
      )
    );
  }

  const mediaTypeObject: OpenAPIV3.MediaTypeObject = {};
  groupedOperations.push(
    PatchOperationGroup.create(
      `add response body for content type '${contentType}'`,
      {
        op: 'add',
        path: jsonPointerHelpers.compile([
          'responses',
          statusCode,
          'content',
          contentType,
        ]),
        value: mediaTypeObject,
      }
    )
  );
  yield {
    description: `add ${contentType} response for ${statusCode}`,
    impact: [PatchImpact.Addition, PatchImpact.BackwardsCompatible],
    diff,
    groupedOperations,
  };
}

function* missingResponseBody(
  diff: OperationDiffResult & {
    kind: OperationDiffResultKind.MissingResponseBody;
  },
  operation: Operation
): IterableIterator<OperationPatch> {
  const { statusCode } = diff;
  const response = operation.responses[statusCode] as OpenAPIV3.ResponseObject;

  const contentSize = [...Object.keys(response.content || {})].length;

  const operationGroup = PatchOperationGroup.create(
    `remove response content (${
      contentSize > 0 ? `${contentSize} bodies` : 'empty'
    })`,
    {
      op: 'remove',
      path: jsonPointerHelpers.compile(['responses', statusCode, 'content']),
    }
  );

  yield {
    description: `remove response content for ${statusCode}`,
    impact: [
      contentSize > 0
        ? PatchImpact.BackwardsIncompatible
        : PatchImpact.BackwardsCompatible,
    ],
    diff,
    groupedOperations: [operationGroup],
  };
}
