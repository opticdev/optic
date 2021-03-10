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
    variables: {}
  });

  if (!data) {
    return { requests: [], responses: [] };
  } else {
    const request = data.request.find(
      (i: any) => i.pathId === pathId && i.method === method
    );
    if (request) {
      const requests: IRequestBody[] = request.body
        .map((body: any) => {
          return {
            requestId: request.id,
            contentType: body.contentType,
            rootShapeId: body.rootShapeId
          };
        });
      const responses: IResponseBody[] = request.response
        .flatMap((response: any) => {
          return response.body.map((body: any) => {
            return {
              statusCode: response.statusCode,
              responseId: response.responseId,
              contentType: body.contentType,
              rootShapeId: body.rootShapeId
            };
          });
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
