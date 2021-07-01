import { useMemo } from 'react';
import { useSpectacleQuery } from '<src>/contexts/spectacle-provider';

export const AllPathsQuery = `{
    paths {
      parentPathId
      absolutePathPattern
      absolutePathPatternWithParameterNames
      isParameterized
      name
      pathId
      isRemoved
    }
    }`;

export interface IPath {
  absolutePathPattern: string;
  parentPathId: string | null;
  absolutePathPatternWithParameterNames: string;
  isParameterized: boolean;
  name: string;
  pathId: string;
}

interface PathResponse extends IPath {
  isRemoved: boolean;
}

export type PathQueryResponse = {
  paths: PathResponse[];
};

export function usePaths(): { paths: IPath[]; loading?: boolean } {
  const queryInput = {
    query: AllPathsQuery,
    variables: {},
  };

  const { data, loading, error } = useSpectacleQuery<PathQueryResponse>(
    queryInput
  );
  const paths = useMemo(
    () => data?.paths.filter((path) => !path.isRemoved) || [],
    [data]
  );

  if (error) {
    console.error(error);
    debugger;
  }

  if (data) {
    return { paths: paths, loading };
  }

  return { loading, paths: [] };
}
