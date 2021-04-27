import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';
import { useEndpointsChangelog } from './useEndpointsChangelog';

export const AllEndpointsQuery = `{
    requests {
      id
      pathId
      absolutePathPattern
      pathComponents {
        id
        name
        isParameterized
      }
      method
    }
    }`;

export function useEndpoints(
  renderChangesSince?: string
): { endpoints: IEndpoint[]; loading?: boolean } {
  //@TODO

  const endpointsChangelog = useEndpointsChangelog(renderChangesSince);

  const queryInput = {
    query: AllEndpointsQuery,
    variables: {},
  };

  const { data, error } = useSpectacleQuery(queryInput);

  if (error) {
    console.error(error);
    debugger;
  }

  if (data) {
    return { endpoints: endpointQueryResultsToJson(data, endpointsChangelog) };
  } else {
    return { endpoints: [], loading: true };
  }
}

export function useEndpoint(
  pathId: string,
  method: string
): IEndpoint | undefined {
  const results = useEndpoints();
  if (results.endpoints) {
    return results.endpoints.find(
      (i) => i.pathId === pathId && i.method === method
    );
  } else {
    return undefined;
  }
}

export function endpointQueryResultsToJson(
  data: any,
  endpointsChangelog: any[] = []
): IEndpoint[] {
  const commonStart = sharedStart(
    data.requests.map((req: any) => req.absolutePathPattern)
  );

  debugger;

  const endpoints = data.requests.map((request: any) => {
    return {
      pathId: request.pathId,
      method: request.method,
      fullPath: request.absolutePathPattern,
      group: request.absolutePathPattern
        .substring(commonStart.length)
        .split('/')[0],
      pathParameters: [],
      changelog: {
        added: false,
        changed: false,
        removed: false,
      },
    } as IEndpoint;
  });

  return endpoints;
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
