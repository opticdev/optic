import { IRequestSpecTrail } from './request-spec-trail';
import { IInteractionTrail } from './interaction-trail';

// This is a subset of IEndpoint in ui-v2
type EndpointForTrails = {
  pathId: string;
  method: string;
  query: {
    queryParametersId: string;
  } | null;
  requestBodies: {
    requestId: string;
    contentType: string;
  }[];
  responseBodies: {
    responseId: string;
    statusCode: number;
    contentType: string;
  }[];
};

export type LocationDescriptor =
  | {
      type: 'request';
      requestId: string;
      contentType: string;
    }
  | {
      type: 'response';
      responseId: string;
      contentType: string;
      statusCode: number;
    }
  | {
      type: 'query';
      queryParametersId: string;
    }
  | {
      type: 'path_request';
      contentType: string;
    }
  | {
      type: 'path_response';
      statusCode: number;
      contentType?: string; // Content type is nullable for responses without bodies
    }
  | {
      type: 'path_query';
    };

export function locationForTrails(
  trail: IRequestSpecTrail,
  interactionTrail: IInteractionTrail,
  endpoints: EndpointForTrails[]
): {
  pathId: string;
  method: string;
  descriptor: LocationDescriptor;
} | null {
  if ('SpecRoot' in trail) {
    return null;
  } else if ('SpecRequestRoot' in trail || 'SpecRequestBody' in trail) {
    const { requestId } =
      'SpecRequestRoot' in trail
        ? trail.SpecRequestRoot
        : trail.SpecRequestBody;

    let contentType = '';
    const endpoint = endpoints.find(
      (endpoint) =>
        !!endpoint.requestBodies.find((requestBody) => {
          if (requestBody.requestId === requestId) {
            contentType = requestBody.contentType;
          }
          return requestBody.requestId === requestId;
        })
    );

    if (!endpoint) {
      console.error(
        `Could not find endpoint with request ${requestId} in current spec endpoints`
      );
      return null;
    }

    const { method, pathId } = endpoint;

    return {
      pathId: pathId,
      method: method,
      descriptor: {
        type: 'request',
        requestId,
        contentType,
      },
    };
  } else if ('SpecResponseRoot' in trail || 'SpecResponseBody' in trail) {
    const { responseId } =
      'SpecResponseRoot' in trail
        ? trail.SpecResponseRoot
        : trail.SpecResponseBody;

    let contentType = '';
    let statusCode = 0;
    const endpoint = endpoints.find(
      (endpoint) =>
        !!endpoint.responseBodies.find((responseBody) => {
          if (responseBody.responseId === responseId) {
            contentType = responseBody.contentType;
            statusCode = responseBody.statusCode;
          }
          return responseBody.responseId === responseId;
        })
    );

    if (!endpoint) {
      console.error(
        `Could not find endpoint with response ${responseId} in current spec endpoints`
      );
      return null;
    }
    const { pathId, method } = endpoint;

    return {
      pathId: pathId,
      method: method,
      descriptor: {
        type: 'response',
        statusCode: statusCode,
        responseId,
        contentType,
      },
    };
  } else if ('SpecPath' in trail) {
    const { pathId } = trail.SpecPath;
    const method = methodForInteractionTrail(interactionTrail);
    if (!method) {
      console.error('method not found in SpecPath interaction trail');
      return null;
    }

    const inRequest = inRequestForInteractionTrail(interactionTrail);
    const inResponse = inResponseForInteractionTrail(interactionTrail);

    if (inRequest) {
      return {
        pathId,
        method,
        descriptor: {
          type: 'path_request',
          contentType: inRequest.contentType,
        },
      };
    } else if (inResponse) {
      return {
        pathId,
        method,
        descriptor: {
          type: 'path_response',
          contentType: inResponse.contentType,
          statusCode: inResponse.statusCode,
        },
      };
    } else {
      return {
        pathId,
        method,
        descriptor: {
          type: 'path_query',
        },
      };
    }
  } else if ('SpecQueryParameters' in trail) {
    const { queryParametersId } = trail.SpecQueryParameters;
    const endpoint = endpoints.find(
      (endpoint) =>
        endpoint.query && endpoint.query.queryParametersId === queryParametersId
    );

    if (!endpoint) {
      console.error(
        `Could not find endpoint with query ${queryParametersId} in current spec endpoints`
      );
      return null;
    }
    return {
      pathId: endpoint.pathId,
      method: endpoint.method,
      descriptor: {
        type: 'query',
        queryParametersId,
      },
    };
  }
  console.error(`Received an unexpected trail`, trail);
  return null;
}

export function methodForInteractionTrail(
  interactionTrail: IInteractionTrail
): string | undefined {
  const pathComponent = interactionTrail.path.find((pathComponent) => {
    return 'Method' in pathComponent;
  });

  if (pathComponent && 'Method' in pathComponent) {
    return pathComponent.Method.method;
  }
}

export function inResponseForInteractionTrail(
  interactionTrail: IInteractionTrail
): { statusCode: number; contentType?: string } | undefined {
  const last = interactionTrail.path[interactionTrail.path.length - 1];
  if ('ResponseBody' in last) {
    return last.ResponseBody;
  } else if ('ResponseStatusCode' in last) {
    return {
      statusCode: last.ResponseStatusCode.statusCode,
    };
  }
}

export function inRequestForInteractionTrail(
  interactionTrail: IInteractionTrail
): { contentType: string } | undefined {
  const last = interactionTrail.path[interactionTrail.path.length - 1];
  if ('RequestBody' in last) {
    return last.RequestBody;
  }
}
