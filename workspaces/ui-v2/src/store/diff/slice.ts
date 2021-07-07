import { createSlice, SerializedError } from '@reduxjs/toolkit';

import { IValueAffordanceSerializationWithCounterGroupedByDiffHash } from '@useoptic/cli-shared/build/diffs/initial-types';
import { IUnrecognizedUrl } from '@useoptic/spectacle';

import { ParsedDiff } from '<src>/lib/parse-diff';
import { AsyncStatus } from '<src>/types';
import { fetchDiffsForCapture } from './thunks';

// This needs to be exported for typescript to be able to infer typings
export type DiffState = {
  state: AsyncStatus<
    {
      diffs: ParsedDiff[];
      urls: IUnrecognizedUrl[];
      trails: IValueAffordanceSerializationWithCounterGroupedByDiffHash;
    },
    SerializedError
  >;
  // TODO - add in interactions, sharedDiffState data and pending endpoints
};

const initialState: DiffState = {
  state: {
    loading: true,
  },
};

const diffSlice = createSlice({
  name: 'diff',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDiffsForCapture.pending, () => {
      return initialState;
    });
    builder.addCase(fetchDiffsForCapture.fulfilled, (state, action) => {
      state.state = {
        loading: false,
        data: action.payload.data,
      };
    });
    builder.addCase(fetchDiffsForCapture.rejected, (state, action) => {
      state.state = {
        loading: false,
        error: action.error,
      };
    });
  },
});

export const actions = {
  ...diffSlice.actions,
  fetchDiffsForCapture,
};
export const reducer = diffSlice.reducer;
