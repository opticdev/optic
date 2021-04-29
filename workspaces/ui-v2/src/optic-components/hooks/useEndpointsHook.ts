import { useMemo } from 'react';
import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';
import { useEndpointsChangelog } from './useEndpointsChangelog';

export const AllEndpointsQuery = `{
    requests {
      id
      pathId
      absolutePathPattern
      absolutePathPatternWithParameterNames
      pathComponents {
        id
        name
        isParameterized
      }
      method
      pathContributions
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

  const { data, loading, error } = useSpectacleQuery(queryInput);

  if (error) {
    console.error(error);
    debugger;
  }

  const result = useMemo(
    () => (data ? endpointQueryResultsToJson(data, endpointsChangelog) : []),
    [data, endpointsChangelog]
  );
  console.log(result);

  return { endpoints: result, loading };
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

  const endpoints = data.requests.map((request: any) => {
    const hasChangelog = endpointsChangelog.find(
      (i) => i.pathId === request.pathId && i.method === request.method
    );

    return {
      pathId: request.pathId,
      method: request.method,
      fullPath: request.absolutePathPatternWithParameterNames,
      group: request.absolutePathPattern
        .substring(commonStart.length)
        .split('/')[0],
      pathParameters: request.pathComponents,
      description: request.pathContributions.description || '',
      purpose: request.pathContributions.purpose || '',
      changelog: {
        added: hasChangelog ? hasChangelog.change.category === 'added' : false,
        changed: hasChangelog
          ? hasChangelog.change.category === 'changed'
          : false,
        removed: hasChangelog
          ? hasChangelog.change.category === 'removed'
          : false,
      },
    } as IEndpoint;
  });

  return endpoints;
}

export interface IEndpoint {
  pathId: string;
  method: string;
  purpose: string;
  description: string;
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
