import { CapturedRequest } from '../../../captures';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { OpenAPIV3 } from '../../../specs';
import MIMEType from 'whatwg-mimetype';

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

  const requestBodyType = request.body.contentType
    ? new MIMEType(request.body.contentType)
    : null;

  const bodySpec =
    (requestBodyType &&
      Object.entries(spec.content).find(([rawType]) => {
        let parsed = new MIMEType(rawType);
        return parsed.essence == requestBodyType?.essence;
      })?.[1]) ||
    null;

  if (!bodySpec) {
    yield {
      kind: OperationDiffResultKind.UnmatchedRequestBody,
      contentType: request.body.contentType,
    };
  }
}
