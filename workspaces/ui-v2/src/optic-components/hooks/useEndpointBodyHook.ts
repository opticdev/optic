import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';

export function useEndpointBody(
  pathId: string,
  method: string,
  renderChangesSince?: string
): { requests: IRequestBody[]; responses: IResponseBody[] } {
  //@TODO

  const { data } = useSpectacleQuery({
    query: `{
    request {
      id
      pathId
      absolutePathPattern
      method
      body {
        id
        contentType
        rootShapeId
      }
      response {
        id
        statusCode
        body {
          contentType
          rootShapeId
        }
      }
    }
    }`,
    variables: {},
  });

  if (!data) {
    return { requests: [], responses: [] };
  } else {
    const endpoint = data.request.find(
      (i: any) => i.pathId === pathId && i.method === method
    );
    if (endpoint) {
      const requests: IRequestBody[] = [];
      const responses: IResponseBody[] = [];

      endpoint.body.forEach((req: any) => {
        requests.push({
          requestId: req.id,
          contentType: req.contentType,
          rootShapeId: req.rootShapeId,
        });
      });
      endpoint.response.forEach((res: any) => {
        res.body.forEach((i: any) =>
          responses.push({
            statusCode: res.statusCode,
            responseId: res.responseId,
            contentType: i.contentType,
            rootShapeId: i.rootShapeId,
          })
        );
      });
      //
      return { requests, responses };
    } else {
      return { requests: [], responses: [] };
    }
  }
}

export interface IRequestBody {
  requestId: string;
  contentType?: string;
  rootShapeId?: string;
  changelog?: {
    added: boolean;
    removed: boolean;
    changed: boolean;
  };
}

export interface IResponseBody {
  responseId: string;
  statusCode: string;
  contentType?: string;
  rootShapeId?: string;
  changelog?: {
    added: boolean;
    removed: boolean;
    changed: boolean;
  };
}
