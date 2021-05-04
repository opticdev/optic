import { useSpectacleQuery } from '../../../spectacle-implementations/spectacle-provider';
import { IRequestBody, IResponseBody } from '../useEndpointBodyHook';
import { useMemo, useState } from 'react';

export const AllRequestsAndResponsesQuery = `{
    requests {
      id
      pathId
      method
      bodies {
        contentType
        rootShapeId
      }
      responses {
        id
        statusCode
        bodies {
          contentType
          rootShapeId
        }
      }
    }
    }`;

export function useAllRequestsAndResponses(): {
  loading: boolean;
  data?: { requests: IRequestBody[]; responses: IResponseBody[] };
} {
  const [results, setResults] = useState<
    { requests: IRequestBody[]; responses: IResponseBody[] } | undefined
  >(undefined);

  const { data, error } = useSpectacleQuery({
    query: AllRequestsAndResponsesQuery,
    variables: {},
  });

  useMemo(() => {
    if (data) {
      setResults(queryResultToAllRequestsResponses(data));
    }
  }, [data]);

  if (error) {
    console.error(error);
    debugger;
  }

  if (!data) {
    return { loading: true };
  } else {
    return { loading: false, data: results };
  }
}

export function queryResultToAllRequestsResponses(
  data: any,
): { requests: IRequestBody[]; responses: IResponseBody[] } {
  const { requests } = data;

  const allRequests: IRequestBody[] = [];
  const allResponses: IResponseBody[] = [];

  requests.forEach((request: any) => {
    const endpointRequests: IRequestBody[] = request.bodies.map((body: any) => {
      return {
        requestId: request.id,
        contentType: body.contentType,
        rootShapeId: body.rootShapeId,
        method: request.method,
        pathId: request.pathId,
      };
    });
    allRequests.push(...endpointRequests);
    const endpointResponses: IResponseBody[] = request.responses.flatMap(
      (response: any) => {
        return response.bodies.map((body: any) => {
          return {
            statusCode: response.statusCode,
            responseId: response.id,
            contentType: body.contentType,
            rootShapeId: body.rootShapeId,
            method: request.method,
            pathId: request.pathId,
          };
        });
      },
    );
    allResponses.push(...endpointResponses);
  });

  return { requests: allRequests, responses: allResponses };
}
