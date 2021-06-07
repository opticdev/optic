/**
 * There's two places to edit / modify specs - documentation and diffs page, which is
 * why there's two slices distinct from each other (in the future if we have a single
 * flow for editing, we could consolidate the two slices)
 */

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import {
  AddContribution,
  CQRSCommand,
  IForkableSpectacle,
} from '@useoptic/spectacle';

import { RootState, AppDispatch } from './root';
import { getValidContributions } from './selectors';

const saveDocumentationChanges = createAsyncThunk<
  {},
  {
    spectacle: IForkableSpectacle;
    commitMessage: string;
    clientId: string;
    clientSessionId: string;
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  'SAVE_DOCUMENTATION_CHANGES',
  async ({ spectacle, commitMessage, clientId, clientSessionId }, thunkApi) => {
    const state = thunkApi.getState();
    // TODO fetch from spectacle
    // const { deletedEndpoints } = state.documentationEdits;
    const deleteCommands: CQRSCommand[] = [];

    const validContributions = getValidContributions(state);

    const contributionCommands: CQRSCommand[] = validContributions.map(
      (contribution) =>
        AddContribution(
          contribution.id,
          contribution.contributionKey,
          contribution.value
        )
    );

    const commands = [...deleteCommands, ...contributionCommands];

    if (commands.length > 0) {
      await spectacle.mutate({
        query: `
      mutation X(
        $commands: [JSON],
        $batchCommitId: ID,
        $commitMessage: String,
        $clientId: ID,
        $clientSessionId: ID
      ) {
        applyCommands(
          commands: $commands,
          batchCommitId: $batchCommitId,
          commitMessage: $commitMessage,
          clientId: $clientId,
          clientSessionId: $clientSessionId
        ) {
          batchCommitId
        }
      }
      `,
        variables: {
          commands,
          commitMessage,
          batchCommitId: uuidv4(),
          clientId,
          clientSessionId,
        },
      });
    }
  }
);

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
  deletedEndpoints: string[];
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
        endpointId: string;
      }>
    ) => {
      const { endpointId } = action.payload;
      state.deletedEndpoints.push(endpointId);
    },
    undeleteEndpoint: (
      state,
      action: PayloadAction<{
        endpointId: string;
      }>
    ) => {
      const { endpointId } = action.payload;
      const newDeletedEndpoints = state.deletedEndpoints.filter(
        (id) => id === endpointId
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
