import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';

export function useEndpoints(renderChangesSince?: string): IEndpoint[] {
  //@TODO

  const { data } = useSpectacleQuery({
    query: `{
    request {
      id
      pathId
      absolutePathPattern
      method
      body {
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

  if (data) {
    return data.request.map((request: any) => {
      return {
        pathId: request.pathId,
        method: request.method,
        fullPath: request.absolutePathPattern,
        group: 'in ya api',
        pathParameters: [],
      } as IEndpoint;
    });
  }

  return [];
}

export interface IEndpoint {
  pathId: string;
  method: string;
  purpose?: string;
  description?: string;
  fullPath: string;
  pathParameters: IPathParameter[];
  group: string;
  changelog?: {
    added: boolean;
    removed: boolean;
    changed: boolean;
  };
}

export interface IPathParameter {
  pathComponentId: string;
  pathComponentName: string;
}
