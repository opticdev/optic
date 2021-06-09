import {
  createAsyncThunk,
  createSlice,
  SerializedError,
} from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { Client } from '@useoptic/cli-client';
import {
  IOpticConfigRepository,
  IForkableSpectacle,
} from '@useoptic/spectacle';
import { AsyncStatus } from '<src>/types';

const fetchMetadata = createAsyncThunk(
  'FETCH_METADATA',
  async ({
    configRepository,
    spectacle,
  }: {
    configRepository: IOpticConfigRepository;
    spectacle: IForkableSpectacle;
  }) => {
    const client = new Client('/api');

    const apiNamePromise = configRepository.getApiName().catch(() => '');
    const clientAgentPromise = client
      .getIdentity()
      .then((response) => response.json())
      .then(({ anonymousId }) => anonymousId)
      .catch(() => 'anon_id');
    const specMetadataPromise = spectacle
      .query<{
        metadata: {
          id: string;
        };
      }>({
        query: `{
        metadata {
          id
        }
      }`,
        variables: {},
      })
      .then((result) => {
        if (!result.data) {
          throw new Error('Could not fetch spec metadata');
        }
        return result.data.metadata.id;
      });

    const [apiName, clientAgent, specificationId] = await Promise.all([
      apiNamePromise,
      clientAgentPromise,
      specMetadataPromise,
    ]);

    return {
      apiName,
      clientAgent,
      specificationId,
      sessionId: uuidv4(),
    };
  }
);

const initialState = {
  loading: true,
} as AsyncStatus<
  {
    apiName: string;
    clientAgent: string;
    specificationId: string;
    sessionId: string;
  },
  SerializedError
>;

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMetadata.fulfilled, (state, action) => {
      return {
        loading: false,
        data: action.payload,
      };
    });
    builder.addCase(fetchMetadata.rejected, (state, action) => {
      return {
        loading: false,
        error: action.error,
      };
    });
  },
});

export const actions = {
  ...metadataSlice.actions,
  fetchMetadata,
};
export const reducer = metadataSlice.reducer;
