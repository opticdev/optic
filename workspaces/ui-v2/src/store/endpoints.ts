import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { AsyncStatus, IEndpoint } from '<src>/types';
import { findLongestCommonPath } from '<src>/utils';

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
      contributions
      isRemoved
    }
    method
    pathContributions
    isRemoved
  }
}`;

export type EndpointQueryResults = {
  requests: {
    id: string;
    pathId: string;
    absolutePathPattern: string;
    absolutePathPatternWithParameterNames: string;
    pathComponents: {
      id: string;
      name: string;
      isParameterized: boolean;
      contributions: Record<string, string>;
      isRemoved: boolean;
    }[];
    method: string;
    pathContributions: Record<string, string>;
    isRemoved: boolean;
  }[];
};

export const endpointQueryResultsToJson = ({
  requests,
}: EndpointQueryResults) => {
  const commonStart =
    requests.length > 0
      ? findLongestCommonPath(
          requests.map((req) => req.absolutePathPatternWithParameterNames)
        )
      : '/';
  return requests.map((request) => ({
    pathId: request.pathId,
    method: request.method,
    fullPath: request.absolutePathPatternWithParameterNames,
    group: request.absolutePathPatternWithParameterNames
      .slice(commonStart.length)
      .split('/')[1],
    pathParameters: request.pathComponents.map((path) => ({
      id: path.id,
      name: path.name,
      isParameterized: path.isParameterized,
      description: path.contributions.description || '',
      endpointId: `${request.pathId}.${request.method}`,
    })),
    description: request.pathContributions.description || '',
    purpose: request.pathContributions.purpose || '',
    isRemoved: request.isRemoved,
  }));
};

const fetchEndpoints = createAsyncThunk<
  EndpointQueryResults,
  { spectacle: IForkableSpectacle }
>('FETCH_ENDPOINTS', async ({ spectacle }) => {
  const results = await spectacle.query<EndpointQueryResults>({
    query: AllEndpointsQuery,
    variables: {},
  });
  if (results.errors) {
    console.error(results.errors);
    throw new Error();
  }
  return results.data!;
});

const initialState: {
  results: AsyncStatus<IEndpoint[], SerializedError>;
} = {
  results: {
    loading: true,
  },
};

const endpointsSlice = createSlice({
  name: 'endpoints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchEndpoints.fulfilled, (state, action) => {
      const results = action.payload;

      state.results = {
        loading: false,
        data: endpointQueryResultsToJson(results),
      };
    });
    builder.addCase(fetchEndpoints.rejected, (state, action) => {
      state.results = {
        loading: false,
        error: action.error,
      };
    });
  },
});

export const actions = {
  fetchEndpoints,
};
export const reducer = endpointsSlice.reducer;
