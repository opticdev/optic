import { IRequestSpecTrail, RequestTrailConstants } from './request-spec-trail';
import {
  IInteractionTrail,
  IMethod,
  IRequestBody,
  IResponseBody,
  IResponseStatusCode,
} from './interaction-trail';
import { DiffRfcBaseState } from './diff-rfc-base-state';

function getNormalizedBodyDescriptor(value) {
  if (value && value.ShapedBodyDescriptor) {
    return value.ShapedBodyDescriptor;
  }
  return {};
}

export function locationForTrails(
  trail: IRequestSpecTrail,
  interactionTrail: IInteractionTrail,
  diffRfcBaseState: DiffRfcBaseState
):
  | {
      pathId: string;
      method: string;
      requestId?: string;
      responseId?: string;
      inRequest?: boolean;
      inResponse?: boolean;
      statusCode?: number;
      contentType?: string;
    }
  | undefined {
  const { requests, responses } = diffRfcBaseState.queries.requestsState();

  if (trail[RequestTrailConstants.SpecRoot]) {
    return undefined;
  }

  if (trail[RequestTrailConstants.SpecRequestBody]) {
    const { requestId } = trail[RequestTrailConstants.SpecRequestBody];
    const { pathComponentId, httpMethod, bodyDescriptor } = requests[
      requestId
    ].requestDescriptor;

    const contentType = getNormalizedBodyDescriptor(bodyDescriptor)
      ?.httpContentType;

    return {
      pathId: pathComponentId,
      method: httpMethod,
      requestId,
      contentType,
      inRequest: true,
    };
  }

  if (trail[RequestTrailConstants.SpecRequestRoot]) {
    const { requestId } = trail[RequestTrailConstants.SpecRequestRoot];
    const { pathComponentId, httpMethod, bodyDescriptor } = requests[
      requestId
    ].requestDescriptor;
    const contentType = getNormalizedBodyDescriptor(bodyDescriptor)
      ?.httpContentType;

    return {
      pathId: pathComponentId,
      requestId,
      method: httpMethod,
      contentType,
      inRequest: true,
    };
  }

  if (trail[RequestTrailConstants.SpecResponseBody]) {
    const { responseId } = trail[RequestTrailConstants.SpecResponseBody];
    const { pathId, httpMethod, httpStatusCode, bodyDescriptor } = responses[
      responseId
    ].responseDescriptor;
    const contentType = getNormalizedBodyDescriptor(bodyDescriptor)
      ?.httpContentType;

    return {
      pathId: pathId,
      method: httpMethod,
      statusCode: httpStatusCode,
      responseId,
      contentType,
      inResponse: true,
    };
  }

  if (trail[RequestTrailConstants.SpecResponseRoot]) {
    const { responseId } = trail[RequestTrailConstants.SpecResponseRoot];
    const { pathId, httpMethod, httpStatusCode, bodyDescriptor } = responses[
      responseId
    ].responseDescriptor;

    const contentType = getNormalizedBodyDescriptor(bodyDescriptor)
      ?.httpContentType;

    return {
      pathId: pathId,
      method: httpMethod,
      statusCode: httpStatusCode,
      responseId,
      contentType,
      inResponse: true,
    };
  }

  // New Bodies
  if (trail[RequestTrailConstants.SpecPath]) {
    const { pathId } = trail[RequestTrailConstants.SpecPath];
    const methodOption = methodForInteractionTrail(interactionTrail);

    const inRequest = inRequestForInteractionTrail(interactionTrail);
    const inResponse = inResponseForInteractionTrail(interactionTrail);

    const statusCode = inResponse && inResponse.statusCode;

    const contentType =
      (inRequest && inRequest.contentType) ||
      (inResponse && inResponse.contentType);

    if (methodOption) {
      return { pathId, method: methodOption, statusCode, contentType };
    }
  }
}

export function methodForInteractionTrail(
  interactionTrail: IInteractionTrail
): string | undefined {
  //@ts-ignore
  const Method: IMethod | undefined = interactionTrail.path.find((i) => {
    return i['Method'];
  });

  if (Method) {
    return Method!.Method.method;
  }
}

export function inResponseForInteractionTrail(
  interactionTrail: IInteractionTrail
): { statusCode: number; contentType?: string } | undefined {
  const last = interactionTrail.path[interactionTrail.path.length - 1];
  if (last['ResponseBody']) {
    const asResponseBody = last as IResponseBody;
    return asResponseBody.ResponseBody;
  }
  if (last['ResponseStatusCode']) {
    const asResponseBody = last as IResponseStatusCode;
    return {
      statusCode: asResponseBody.ResponseStatusCode.statusCode,
    };
  }
}

export function inRequestForInteractionTrail(
  interactionTrail: IInteractionTrail
): { contentType: string } | undefined {
  const last = interactionTrail.path[interactionTrail.path.length - 1];
  if (last['RequestBody']) {
    const asRequestBody = last as IRequestBody;
    return asRequestBody.RequestBody;
  }
}
