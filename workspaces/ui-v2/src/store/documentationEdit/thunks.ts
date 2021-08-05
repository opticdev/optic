import { createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/react';
import { IForkableSpectacle } from '@useoptic/spectacle';

import {
  AddContribution,
  CQRSCommand,
  PrunePathComponents,
} from '@useoptic/optic-domain';
import { SpectacleClient } from '<src>/clients';
import { RootState, AppDispatch } from '../root';
import { getValidContributions } from '../selectors';

const fetchRemoveEndpointCommands = async (
  spectacle: IForkableSpectacle,
  pathId: string,
  method: string
): Promise<CQRSCommand[]> => {
  const spectacleClient = new SpectacleClient(spectacle);
  try {
    return spectacleClient.fetchRemoveEndpointCommands(pathId, method);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw e;
  }
};

const fetchFieldRemoveCommands = async (
  spectacle: IForkableSpectacle,
  fieldId: string
): Promise<CQRSCommand[]> => {
  const spectacleClient = new SpectacleClient(spectacle);
  try {
    return spectacleClient.fetchFieldRemoveCommands(fieldId);
  } catch (e) {
    console.error(e);
    Sentry.captureException(e);
    throw e;
  }
};

export const saveDocumentationChanges = createAsyncThunk<
  {},
  {
    spectacle: IForkableSpectacle;
    commitMessage: string;
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>(
  'SAVE_DOCUMENTATION_CHANGES',
  async ({ spectacle, commitMessage }, thunkApi) => {
    const state = thunkApi.getState();
    const clientId = state.metadata.data?.clientAgent || '';
    const clientSessionId = state.metadata.data?.sessionId || '';

    const { removedEndpoints } = state.documentationEdits;
    const { removedFields } = state.documentationEdits.fieldEdits;

    const removeFieldCommandsPromise: Promise<CQRSCommand[]> = Promise.all(
      removedFields.map((fieldId) =>
        fetchFieldRemoveCommands(spectacle, fieldId)
      )
    ).then((fieldCommands) => fieldCommands.flat());

    const removeEndpointCommandsPromise: Promise<CQRSCommand[]> = Promise.all(
      removedEndpoints.map(({ pathId, method }) =>
        fetchRemoveEndpointCommands(
          spectacle,
          pathId,
          method
        ).then((removeCommands) =>
          removeCommands.concat([PrunePathComponents()])
        )
      )
    ).then((endpointCommands) => endpointCommands.flat());

    const [removeFieldCommands, removeEndpointCommands] = await Promise.all([
      removeFieldCommandsPromise,
      removeEndpointCommandsPromise,
    ]);

    const validContributions = getValidContributions(state);

    const contributionCommands: CQRSCommand[] = validContributions.map(
      (contribution) =>
        AddContribution(
          contribution.id,
          contribution.contributionKey,
          contribution.value
        )
    );

    // Apply these in order for consistency - we generate the commands in parallel and then apply them all at once
    // To be safer, we could apply the commands sequentially before generating the next commands
    const commands = [
      ...contributionCommands,
      ...removeFieldCommands,
      ...removeEndpointCommands,
    ];

    if (commands.length > 0) {
      try {
        await spectacle.mutate({
          query: `
          mutation X(
            $commands: [JSON!]!,
            $batchCommitId: ID!,
            $commitMessage: String!,
            $clientId: ID!,
            $clientSessionId: ID!
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
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        throw e;
      }
    }
  }
);
