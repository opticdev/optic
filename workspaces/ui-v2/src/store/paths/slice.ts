import { createSlice, SerializedError } from '@reduxjs/toolkit';

import { AsyncStatus, IPath } from '<src>/types';

import { fetchPaths } from './thunks';

const initialState: {
  results: AsyncStatus<IPath[], SerializedError>;
} = {
  results: {
    loading: true,
  },
};

const pathsSlice = createSlice({
  name: 'paths',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPaths.pending, (state) => {
      state.results = {
        loading: true,
      };
    });
    builder.addCase(fetchPaths.fulfilled, (state, action) => {
      const results = action.payload;

      state.results = {
        loading: false,
        data: results,
      };
    });
    builder.addCase(fetchPaths.rejected, (state, action) => {
      state.results = {
        loading: false,
        error: action.error,
      };
    });
  },
});

export const actions = {
  fetchPaths,
};
export const reducer = pathsSlice.reducer;
