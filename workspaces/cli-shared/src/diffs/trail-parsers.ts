import { IRequestSpecTrail } from './request-spec-trail';
import { IInteractionTrail } from './interaction-trail';

// TODO QPB - remove these types - these are the same as the types in ui-v2 - these should be moved to optic-domain
export interface IPathParameter {
  id: string;
  name: string;
  isParameterized: boolean;
  description: string;
  endpointId: string;
}

interface IEndpoint {
  pathId: string;
  method: string;
  purpose: string;
  description: string;
  fullPath: string;
  pathParameters: IPathParameter[];
  isRemoved: boolean;
  query: IQueryParameters | null;
  requestBodies: IRequestBody[];
  responseBodies: IResponseBody[];
}

export interface IQueryParameters {
  queryParametersId: string;
  rootShapeId: string;
  isRemoved: boolean;
  description: string;
}

export interface IRequestBody {
  requestId: string;
  contentType: string;
  rootShapeId: string;
  pathId: string;
  method: string;
  description: string;
}

export interface IResponseBody {
  responseId: string;
  statusCode: number;
  contentType: string;
  rootShapeId: string;
  pathId: string;
  method: string;
  description: string;
}
// TODO QPB remove / reduce undefined or add in better error messages when missing + sentry
export function locationForTrails(
  trail: IRequestSpecTrail,
  interactionTrail: IInteractionTrail,
  endpoints: IEndpoint[]
  // TODO QPB use IParsedLocation type instead
): {
  pathId: string;
  method: string;
  inQuery?: boolean;
  queryParametersId?: string;
  inRequest?: boolean;
  inResponse?: boolean;
  requestId?: string;
  responseId?: string;
  contentType?: string;
  statusCode?: number;
} | null {
  if ('SpecRoot' in trail) {
    return null;
  } else if ('SpecRequestRoot' in trail || 'SpecRequestBody' in trail) {
    const { requestId } =
      'SpecRequestRoot' in trail
        ? trail.SpecRequestRoot
        : trail.SpecRequestBody;

    let request = null;
    for (const endpoint of endpoints) {
      for (const requestBody of endpoint.requestBodies) {
        if (requestBody.requestId === requestId) {
          request = requestBody;
          break;
        }
      }
      if (request) {
        break;
      }
    }

    if (!request) {
      console.error(
        `Could not find endpoint with request ${requestId} in current spec endpoints`
      );
      return null;
    }

    const { method, pathId, contentType } = request;

    return {
      pathId: pathId,
      method: method,
      requestId,
      contentType,
      inRequest: true,
    };
  } else if ('SpecResponseRoot' in trail || 'SpecResponseBody' in trail) {
    const { responseId } =
      'SpecResponseRoot' in trail
        ? trail.SpecResponseRoot
        : trail.SpecResponseBody;
    let response = null;
    for (const endpoint of endpoints) {
      for (const responseBody of endpoint.responseBodies) {
        if (responseBody.responseId === responseId) {
          response = responseBody;
          break;
        }
      }
      if (response) {
        break;
      }
    }

    if (!response) {
      console.error(
        `Could not find endpoint with response ${responseId} in current spec endpoints`
      );
      return null;
    }
    const { pathId, method, statusCode, contentType } = response;

    return {
      pathId: pathId,
      method: method,
      statusCode: statusCode,
      responseId,
      contentType,
      inResponse: true,
    };
  } else if ('SpecPath' in trail) {
    const { pathId } = trail.SpecPath;
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
      inQuery: true,
      queryParametersId,
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
