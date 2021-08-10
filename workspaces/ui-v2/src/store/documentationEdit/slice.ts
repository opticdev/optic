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
  fields: {
    edited: Record<
      string,
      {
        isOptional: boolean;
        isNullable: boolean;
      }
    >;
    removed: string[];
  };
  removedEndpoints: {
    pathId: string;
    method: string;
  }[];
  commitModalOpen: boolean;
  isEditing: boolean;
};

const initialState: DocumentationEditState = {
  contributions: {},
  removedEndpoints: [],
  fields: {
    edited: {},
    removed: [],
  },
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
    // TODO FLEB connect this up to the UI
    removeContribution: (
      state,
      action: PayloadAction<{
        id: string;
        contributionKey: string;
      }>
    ) => {
      const { id, contributionKey } = action.payload;
      if (state.contributions[id]?.[contributionKey]) {
        delete state.contributions[id][contributionKey];
      }
    },
    // TODO FLEB connect this up to the UI
    addFieldEdit: (
      state,
      action: PayloadAction<{
        fieldId: string;
        options: {
          isOptional: boolean;
          isNullable: boolean;
        };
      }>
    ) => {
      const { fieldId, options } = action.payload;
      state.fields.edited[fieldId] = options;
    },
    // TODO FLEB connect this up to the UI
    removeFieldEdit: (
      state,
      action: PayloadAction<{
        fieldId: string;
      }>
    ) => {
      const { fieldId } = action.payload;
      if (fieldId in state.fields.edited) {
        delete state.fields.edited[fieldId];
      }
    },
    removeEndpoint: (
      state,
      action: PayloadAction<{
        pathId: string;
        method: string;
      }>
    ) => {
      state.removedEndpoints.push(action.payload);
    },
    unremoveEndpoint: (
      state,
      action: PayloadAction<{
        pathId: string;
        method: string;
      }>
    ) => {
      const { pathId, method } = action.payload;
      const newRemovedEndpoints = state.removedEndpoints.filter(
        (endpoint) =>
          !(pathId === endpoint.pathId && method === endpoint.method)
      );
      state.removedEndpoints = newRemovedEndpoints;
    },
    removeField: (state, action: PayloadAction<{ fieldId: string }>) => {
      // @GOTCHA - selecting a field, and then selecting a parent of this field (e.g. an object that contains this removed field)
      // will count as a two selected fields. This is still correct, just extra commands
      state.fields.removed.push(action.payload.fieldId);
    },
    unremoveField: (state, action: PayloadAction<{ fieldId: string }>) => {
      state.fields.removed = state.fields.removed.filter(
        (removedFieldId) => removedFieldId !== action.payload.fieldId
      );
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
