import { IRequestSpecTrail, RequestTrailConstants } from './request-spec-trail';
import { IInteractionTrail, IMethod } from './interaction-trail';
import { DiffRfcBaseState } from './diff-rfc-base-state';
import { getNormalizedBodyDescriptor } from '../../utilities/RequestUtilities';

export function locationForTrails(
  trail: IRequestSpecTrail,
  interactionTrail: IInteractionTrail,
  diffRfcBaseState: DiffRfcBaseState
):
  | {
      pathId: string;
      method: string;
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

  if (trail[RequestTrailConstants.SpecPath]) {
    const { pathId } = trail[RequestTrailConstants.SpecPath];
    const methodOption = methodForInteractionTrail(interactionTrail);
    if (methodOption) {
      return { pathId, method: methodOption };
    }
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
      contentType,
      inResponse: true,
    };
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
