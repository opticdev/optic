import { CapturedResponse } from '../../../captures';
import { OpenAPIV3 } from '../../../specs';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { findResponse } from '../..';

export function* visitResponses(
  capturedResponse: CapturedResponse,
  responses: { [statusCode: string]: OpenAPIV3.ResponseObject }
): IterableIterator<OperationDiffResult> {
  const responseMatch = findResponse(
    { responses },
    capturedResponse.statusCode
  );

  if (!responseMatch) {
    const statusCode = parseInt(capturedResponse.statusCode, 10);
    if (statusCode >= 200 && statusCode < 500) {
      // TODO: consider whether this range check should be on the patching side,
      // as that's where we want to control what to patch. the diff is factually correct, right?
      yield {
        kind: OperationDiffResultKind.UnmatchedResponseStatusCode,
        statusCode: capturedResponse.statusCode,
        contentType: capturedResponse.body?.contentType || null,
      };
    }

    return; // no response, no more to diff
  }

  const [response] = responseMatch;

  const contentSpec =
    capturedResponse.body?.contentType &&
    response.content?.[capturedResponse.body.contentType];

  if (!contentSpec && capturedResponse.body) {
    yield {
      kind: OperationDiffResultKind.UnmatchedResponseBody,
      contentType: capturedResponse.body.contentType,
      statusCode: capturedResponse.statusCode,
    };
  } else if (response.content && !capturedResponse.body) {
    yield {
      kind: OperationDiffResultKind.MissingResponseBody,
      statusCode: capturedResponse.statusCode,
    };
  }
}
