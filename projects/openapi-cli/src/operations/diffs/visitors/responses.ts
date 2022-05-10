import { CapturedResponse } from '../../../captures';
import { OpenAPIV3 } from '../../../specs';
import { OperationDiffResult, OperationDiffResultKind } from '../result';

export function* visitResponses(
  capturedResponse: CapturedResponse,
  responses: { [statusCode: string]: OpenAPIV3.ResponseObject }
): IterableIterator<OperationDiffResult> {
  const response = findResponse(responses, capturedResponse.statusCode);

  if (!response) {
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

const statusRangePattern = /[245]xx/;

function findResponse(
  responses: { [statusCode: string]: OpenAPIV3.ResponseObject },
  statusCode: string
): OpenAPIV3.ResponseObject | null {
  let exactMatch: OpenAPIV3.ResponseObject | null = null;
  let rangeMatch: OpenAPIV3.ResponseObject | null = null;
  let defaultMatch: OpenAPIV3.ResponseObject | null = null;

  // oldskool for loop, because no object.find and work arounds are messy
  for (let [code, response] of Object.entries(responses)) {
    if (code === statusCode) {
      exactMatch = response;
      break; // exact match found, so we can stop looking
    }

    if (
      !rangeMatch &&
      statusRangePattern.test(statusCode) &&
      statusCode.substring(0, 1) === code.substring(0, 1)
    ) {
      rangeMatch = response;
      continue;
    }

    if (!defaultMatch && code === 'default') {
      defaultMatch = response;
    }

    if (exactMatch && rangeMatch && defaultMatch) break;
  }

  return exactMatch || rangeMatch || defaultMatch;
}
