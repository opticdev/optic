import { CapturedResponse } from '../../../captures';
import { OpenAPIV3 } from '../../../specs';
import { OperationDiffResult, OperationDiffResultKind } from '../result';
import { findResponse } from '../..';
import MIMEType from 'whatwg-mimetype';

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
    yield {
      kind: OperationDiffResultKind.UnmatchedResponseStatusCode,
      statusCode: capturedResponse.statusCode,
      contentType: capturedResponse.body?.contentType || null,
    };

    return; // no response, no more to diff
  }

  const [response] = responseMatch;

  const rawContentType = capturedResponse.body?.contentType;
  const capturedContentType = rawContentType
    ? new MIMEType(rawContentType)
    : null;

  const contentSpec =
    response.content && capturedContentType
      ? Object.entries(response.content).find(([rawType]) => {
          let parsed = new MIMEType(rawType);
          return parsed.essence === capturedContentType.essence;
        })?.[1]
      : null;
  // capturedResponse.body?.contentType &&
  // response.content?.[capturedResponse.body.contentType];

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
