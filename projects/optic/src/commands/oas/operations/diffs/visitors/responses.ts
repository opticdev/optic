import { CapturedResponse } from '../../../captures';
import { OpenAPIV3 } from '../../../specs';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { findResponse, findBody } from '../..';

export function* visitResponses(
  capturedResponse: CapturedResponse,
  responses: { [statusCode: string]: OpenAPIV3.ResponseObject }
): IterableIterator<OperationDiffResult> {
  if (capturedResponse) {
    const responseMatch = findResponse(
      { responses },
      capturedResponse.statusCode
    );

    if (!responseMatch) {
      const statusCode = parseInt(capturedResponse.statusCode, 10);
      yield {
        kind: OperationDiffResultKind.UnmatchedResponseStatusCode,
        statusCode: capturedResponse.statusCode,
        contentType: capturedResponse.body?.contentType || null,
      };

      return; // no response, no more to diff
    }

    const [response] = responseMatch;

    const matchedBody = findBody(response, capturedResponse.body?.contentType);

    if (!matchedBody && capturedResponse.body) {
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
}
