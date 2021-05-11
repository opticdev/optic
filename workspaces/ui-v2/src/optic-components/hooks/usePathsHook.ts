import { useSpectacleQuery } from '../../spectacle-implementations/spectacle-provider';

export const AllPathsQuery = `{
    paths {
      absolutePathPattern
      absolutePathPatternWithParameterNames
      isParameterized
      name
      pathId
    }
    }`;

export function usePaths(): { paths: IPath[]; loading?: boolean } {
  const queryInput = {
    query: AllPathsQuery,
    variables: {},
  };

  const { data, loading, error } = useSpectacleQuery<any>(queryInput);

  if (error) {
    console.error(error);
    debugger;
  }

  if (data) {
    return { paths: data.paths as IPath[], loading };
  }

  return { loading, paths: [] };
}

export interface IPath {
  absolutePathPattern: string;
  absolutePathPatternWithParameterNames: string;
  isParameterized: boolean;
  name: string;
  pathId: string;
}
