import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';

export function useEndpointBody(
  pathId: string,
  method: string,
  renderChangesSince?: string
): { requests: IRequestBody[]; responses: IResponseBody[] } {
  //@TODO

  const { data, error } = useSpectacleQuery({
    query: `{
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
    }`,
    variables: {}
  });
  if (error) {
    console.error(error);
    debugger
  }
  if (!data) {
    return { requests: [], responses: [] };
  } else {
    debugger
    const request = data.requests.find(
      (i: any) => i.pathId === pathId && i.method === method
    );
    if (!request) {
      return { requests: [], responses: [] };
    }
    const requests: IRequestBody[] = request.bodies
      .map((body: any) => {
        return {
          requestId: request.id,
          contentType: body.contentType,
          rootShapeId: body.rootShapeId
        };
      });
    const responses: IResponseBody[] = request.responses
      .flatMap((response: any) => {
        return response.bodies.map((body: any) => {
          return {
            statusCode: response.statusCode,
            responseId: response.id,
            contentType: body.contentType,
            rootShapeId: body.rootShapeId
          };
        });
      });

    return { requests, responses };
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
