/**
 * There's two places to edit / modify specs - documentation and diffs page, which is
 * why there's two slices distinct from each other (in the future if we have a single
 * flow for editing, we could consolidate the two slices)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { saveDocumentationChanges } from './thunks';

// This needs to be exported for typescript to be able to infer typings
export type DocumentationEditState = {
  contributions: Record<
    string,
    Record<
      string,
      {
        endpointId: string;
        value: string;
      }
    >
  >;
  deletedEndpoints: {
    pathId: string;
    method: string;
  }[];
  commitModalOpen: boolean;
  isEditing: boolean;
};

const initialState: DocumentationEditState = {
  contributions: {},
  deletedEndpoints: [],
  commitModalOpen: false,
  isEditing: false,
};

const documentationEditSlice = createSlice({
  name: 'documentationEdit',
  initialState,
  reducers: {
    addContribution: (
      state,
      action: PayloadAction<{
        endpointId: string;
        id: string;
        contributionKey: string;
        value: string;
      }>
    ) => {
      const { id, contributionKey, value, endpointId } = action.payload;
      if (!state.contributions[id]) {
        state.contributions[id] = {
          [contributionKey]: {
            value,
            endpointId,
          },
        };
      } else {
        state.contributions[id][contributionKey] = {
          value,
          endpointId,
        };
      }
    },
    deleteEndpoint: (
      state,
      action: PayloadAction<{
        pathId: string;
        method: string;
      }>
    ) => {
      state.deletedEndpoints.push(action.payload);
    },
    undeleteEndpoint: (
      state,
      action: PayloadAction<{
        pathId: string;
        method: string;
      }>
    ) => {
      const { pathId, method } = action.payload;
      const newDeletedEndpoints = state.deletedEndpoints.filter(
        (endpoint) => pathId !== endpoint.pathId && method !== endpoint.method
      );
      state.deletedEndpoints = newDeletedEndpoints;
    },
    updateCommitModalState: (
      state,
      action: PayloadAction<{
        commitModalOpen: boolean;
      }>
    ) => {
      const { commitModalOpen } = action.payload;
      state.commitModalOpen = commitModalOpen;
    },
    updateEditState: (
      state,
      action: PayloadAction<{
        isEditing: boolean;
      }>
    ) => {
      const { isEditing } = action.payload;
      state.isEditing = isEditing;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveDocumentationChanges.fulfilled, () => {
      return initialState;
    });
  },
});

export const actions = {
  ...documentationEditSlice.actions,
  saveDocumentationChanges,
};
export const reducer = documentationEditSlice.reducer;
