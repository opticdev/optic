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
  } | null;
};

const fetchRemoveEndpointCommands = async (
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
      console.error(results.errors);
      throw new Error(JSON.stringify(results.errors));
    }
    if (!results.data || !results.data.endpoint) {
      const message = `Could not generate removal commands for endpoint path: ${pathId} and method: ${method}`;
      console.error(message);
      throw new Error(message);
    }
    return results.data.endpoint.commands.remove;
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

    // TODO FLEB fetch remove field commands
    // TODO FLEB filter out field remove commands if in deleted endpoint

    const removeCommands: CQRSCommand[] = (
      await Promise.all(
        removedEndpoints.map(({ pathId, method }) =>
          fetchRemoveEndpointCommands(
            spectacle,
            pathId,
            method
          ).then((removeCommands) =>
            removeCommands.concat([PrunePathComponents()])
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

    const commands = [...removeCommands, ...contributionCommands];

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
