import { useSpectacleQuery } from '<src>/contexts/spectacle-provider';

export const AllPathsQuery = `{
    paths {
      parentPathId
      absolutePathPattern
      absolutePathPatternWithParameterNames
      isParameterized
      name
      pathId
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

export type PathQueryResponse = {
  paths: IPath[];
};

export function usePaths(): { paths: IPath[]; loading?: boolean } {
  const queryInput = {
    query: AllPathsQuery,
    variables: {},
  };

  const { data, loading, error } = useSpectacleQuery<PathQueryResponse>(
    queryInput
  );

  if (error) {
    console.error(error);
    debugger;
  }

  if (data) {
    return { paths: data.paths, loading };
  }

  return { loading, paths: [] };
}
