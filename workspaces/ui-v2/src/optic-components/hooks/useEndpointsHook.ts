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
    debugger;
  }

  if (data) {
    const commonStart = sharedStart(
      data.requests.map((req: any) => req.absolutePathPattern)
    );

    const requests = data.requests.map((request: any) => {
      return {
        pathId: request.pathId,
        method: request.method,
        fullPath: request.absolutePathPattern,
        group: request.absolutePathPattern
          .substring(commonStart.length)
          .split('/')[0],
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

function sharedStart(array: string[]): string {
  if (array.length === 0) return '/';
  let A = array.concat().sort(),
    a1 = A[0],
    a2 = A[A.length - 1],
    L = a1.length,
    i = 0;
  while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
  return a1.substring(0, i);
}
