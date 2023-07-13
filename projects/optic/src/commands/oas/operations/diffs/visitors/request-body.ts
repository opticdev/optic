import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { OpenAPIV3 } from '../../../specs';
import { findBody } from '../..';
import { CapturedRequest } from '../../../../capture/sources/captured-interactions';

export function* visitRequestBody(
  request: CapturedRequest,
  spec?: OpenAPIV3.RequestBodyObject
): IterableIterator<OperationDiffResult> {
  if (!spec) {
    if (request.body) {
      // no request body was documented, but present in interaction
      yield {
        kind: OperationDiffResultKind.UnmatchedRequestBody,
        contentType: request.body.contentType,
      };
    }
    return; // no spec, nothing left to diff
  }

  if (!request.body) {
    if (spec.required) {
      yield {
        kind: OperationDiffResultKind.MissingRequestBody,
      };
    }

    return; // no request body, nothing left to diff
  }

  const matchedBody = findBody(spec, request.body.contentType);

  if (!matchedBody) {
    yield {
      kind: OperationDiffResultKind.UnmatchedRequestBody,
      contentType: request.body.contentType,
    };
  }
}
