import { CurrentSpecContext } from './Interfaces';
import {
  IInteractionTrail,
  IRequestBody,
  IResponseBody,
  IResponseStatusCode,
} from '@useoptic/cli-shared/build/diffs/interaction-trail';
import {
  IRequestSpecTrail,
  RequestTrailConstants,
} from '@useoptic/cli-shared/build/diffs/request-spec-trail';

export function locationForTrails(
  trail: IRequestSpecTrail,
  interactionTrail: IInteractionTrail,
  currentSpecContext: CurrentSpecContext,
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
  const { currentSpecRequests, currentSpecResponses } = currentSpecContext;
  const requests = currentSpecRequests;
  const responses = currentSpecResponses;

  function requestById(id: string) {
    return requests.find((i) => i.requestId === id)!;
  }

  function responseById(id: string) {
    return responses.find((i) => i.responseId === id)!;
  }

  if ((trail as any)[RequestTrailConstants.SpecRoot]) {
    return undefined;
  }

  if ((trail as any)[RequestTrailConstants.SpecRequestBody]) {
    const { requestId } = (trail as any)[RequestTrailConstants.SpecRequestBody];
    const { method, pathId, contentType } = requestById(requestId);

    return {
      pathId: pathId,
      method: method,
      requestId,
      contentType,
      inRequest: true,
    };
  }

  if ((trail as any)[RequestTrailConstants.SpecRequestRoot]) {
    const { requestId } = (trail as any)[RequestTrailConstants.SpecRequestRoot];
    const { method, pathId, contentType } = requestById(requestId);

    return {
      pathId: pathId,
      requestId,
      method: method,
      contentType,
      inRequest: true,
    };
  }

  if ((trail as any)[RequestTrailConstants.SpecResponseBody]) {
    const { responseId } = (trail as any)[
      RequestTrailConstants.SpecResponseBody
    ];
    const { pathId, method, statusCode, contentType } = responseById(
      responseId,
    );
    return {
      pathId: pathId,
      method: method,
      statusCode: statusCode,
      responseId,
      contentType,
      inResponse: true,
    };
  }

  if ((trail as any)[RequestTrailConstants.SpecResponseRoot]) {
    const { responseId } = (trail as any)[
      RequestTrailConstants.SpecResponseRoot
    ];
    const { pathId, method, statusCode, contentType } = responseById(
      responseId,
    );

    return {
      pathId: pathId,
      method: method,
      statusCode: statusCode,
      responseId,
      contentType: contentType,
      inResponse: true,
    };
  }

  // New Bodies
  if ((trail as any)[RequestTrailConstants.SpecPath]) {
    const { pathId } = (trail as any)[RequestTrailConstants.SpecPath];
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
  interactionTrail: IInteractionTrail,
): string | undefined {
  //@ts-ignore
  const Method: IMethod | undefined = interactionTrail.path.find((i) => {
    return (i as any)['Method'];
  });

  if (Method) {
    return Method!.Method.method;
  }
}

export function inResponseForInteractionTrail(
  interactionTrail: IInteractionTrail,
): { statusCode: number; contentType?: string } | undefined {
  const last = interactionTrail.path[interactionTrail.path.length - 1];
  if ((last as any)['ResponseBody']) {
    const asResponseBody = last as IResponseBody;
    return asResponseBody.ResponseBody;
  }
  if ((last as any)['ResponseStatusCode']) {
    const asResponseBody = last as IResponseStatusCode;
    return {
      statusCode: asResponseBody.ResponseStatusCode.statusCode,
    };
  }
}

export function inRequestForInteractionTrail(
  interactionTrail: IInteractionTrail,
): { contentType: string } | undefined {
  const last = interactionTrail.path[interactionTrail.path.length - 1];
  if ((last as any)['RequestBody']) {
    const asRequestBody = last as IRequestBody;
    return asRequestBody.RequestBody;
  }
}
