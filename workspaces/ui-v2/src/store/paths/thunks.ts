import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';

import { IForkableSpectacle } from '@useoptic/spectacle';
import { IPath } from '<src>/types';

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

interface PathResponse extends IPath {
  isRemoved: boolean;
}

export type PathQueryResponse = {
  paths: PathResponse[];
};

export const fetchPaths = createAsyncThunk<
  IPath[],
  { spectacle: IForkableSpectacle }
>('FETCH_ENDPOINTS', async ({ spectacle }) => {
  try {
    const results = await spectacle.query<PathQueryResponse>({
      query: AllPathsQuery,
      variables: {},
    });

    if (results.errors) {
      console.error(results.errors);
      throw new Error(JSON.stringify(results.errors));
    }
    return results.data!.paths.filter((path) => !path.isRemoved);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw e;
  }
});
