import { createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/react';
import { IForkableSpectacle } from '@useoptic/spectacle';

import {
  AddContribution,
  CQRSCommand,
  PrunePathComponents,
} from '@useoptic/optic-domain';
import { RootState, AppDispatch } from '../root';
import { getValidContributions } from '../selectors';

type EndpointProjection = {
  endpoint: {
    commands: {
      remove: CQRSCommand[];
    };
  };
};

const fetchDeleteEndpointCommands = async (
  spectacle: IForkableSpectacle,
  pathId: string,
  method: string
): Promise<CQRSCommand[]> => {
  try {
    const results = await spectacle.query<
      EndpointProjection,
      {
        pathId: string;
        method: string;
      }
    >({
      query: `
      query X($pathId: ID!, $method: String!) {
        endpoint(pathId: $pathId, method: $method) {
          commands {
            remove
          }
        }
      }`,
      variables: {
        pathId,
        method,
      },
    });
    if (results.errors) {
      throw new Error();
    }
    return results.data!.endpoint.commands.remove;
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

    const { deletedEndpoints } = state.documentationEdits;

    const deleteCommands: CQRSCommand[] = (
      await Promise.all(
        deletedEndpoints.map(({ pathId, method }) =>
          fetchDeleteEndpointCommands(
            spectacle,
            pathId,
            method
          ).then((deleteCommands) =>
            deleteCommands.concat([PrunePathComponents()])
          )
        )
      )
    ).flatMap((x) => x);

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
