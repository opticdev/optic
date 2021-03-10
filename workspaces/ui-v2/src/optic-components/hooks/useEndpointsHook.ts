import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';

export function useEndpoints(
  renderChangesSince?: string
): { endpoints: IEndpoint[]; loading?: boolean } {
  //@TODO

  const { data, error } = useSpectacleQuery({
    query: `{
    requests {
      id
      pathId
      absolutePathPattern
      method
    }
    }`,
    variables: {},
  });
  if (error) {
    console.error(error);
    debugger
  }

  if (data) {
    const requests = data.requests.map((request: any) => {
      return {
        pathId: request.pathId,
        method: request.method,
        fullPath: request.absolutePathPattern,
        group: 'in ya api',
        pathParameters: [],
      } as IEndpoint;
    });
    return {
      endpoints: requests,
    };
  } else {
    return { endpoints: [], loading: true };
  }
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
