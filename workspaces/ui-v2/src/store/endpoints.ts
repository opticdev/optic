import {
  createSlice,
  createAsyncThunk,
  SerializedError,
} from '@reduxjs/toolkit';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { AsyncStatus, IEndpoint } from '<src>/types';

const initialState: {
  results: AsyncStatus<IEndpoint[], SerializedError>;
} = {
  results: {
    loading: true,
  },
};

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
    }
    method
    pathContributions
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
    }[];
    method: string;
    pathContributions: Record<string, string>;
  }[];
};

export const endpointQueryResultsToJson = ({
  requests,
}: EndpointQueryResults) => {
  const commonStart = sharedStart(
    requests.map((req) => req.absolutePathPatternWithParameterNames)
  );

  return requests.map((request) => ({
    pathId: request.pathId,
    method: request.method,
    fullPath: request.absolutePathPatternWithParameterNames,
    group: request.absolutePathPatternWithParameterNames
      .substring(commonStart.length)
      .split('/')[0],
    pathParameters: request.pathComponents.map((path) => ({
      id: path.id,
      name: path.name,
      isParameterized: path.isParameterized,
      description: path.contributions.description || '',
      endpointId: `${request.pathId}.${request.method}`,
    })),
    description: request.pathContributions.description || '',
    purpose: request.pathContributions.purpose || '',
  }));
};

const fetchEndpoints = createAsyncThunk(
  'FETCH_ENDPOINTS',
  async ({ spectacle }: { spectacle: IForkableSpectacle }) => {
    const results = await spectacle.query<EndpointQueryResults>({
      query: AllEndpointsQuery,
      variables: {},
    });
    if (results.errors) {
      throw new Error();
    }
    return results.data!;
  }
);

export const actions = {
  fetchEndpoints,
};
export const reducer = endpointsSlice.reducer;
