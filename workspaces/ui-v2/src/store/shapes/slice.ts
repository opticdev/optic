import { createSlice, SerializedError } from '@reduxjs/toolkit';

import { AsyncStatus } from '<src>/types';
import { ShapeId, ReduxShape } from './types';
import { fetchShapes } from './thunks';

const initialState: {
  rootShapes: Record<ShapeId, AsyncStatus<ShapeId, SerializedError>>;
  shapeMap: Record<ShapeId, ReduxShape[]>;
} = {
  rootShapes: {},
  shapeMap: {},
};

const shapesSlice = createSlice({
  name: 'shapes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // TODO we probably need to refetch shapes if they get outdated
    builder.addCase(fetchShapes.pending, (state, action) => {
      state.rootShapes[action.meta.arg.rootShapeId] = {
        loading: true,
      };
    });
    builder.addCase(fetchShapes.fulfilled, (state, action) => {
      state.rootShapes[action.meta.arg.rootShapeId] = {
        loading: false,
        data: action.meta.arg.rootShapeId,
      };
      for (const [shapeId, reduxShapes] of Object.entries(action.payload)) {
        state.shapeMap[shapeId] = reduxShapes;
      }
    });
    builder.addCase(fetchShapes.rejected, (state, action) => {
      state.rootShapes[action.meta.arg.rootShapeId] = {
        loading: false,
        error: action.error,
      };
    });
  },
});

export const actions = {
  fetchShapes,
};
export const reducer = shapesSlice.reducer;
