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

type FieldCommands = {
  field: {
    commands: {
      remove: CQRSCommand[];
    };
  } | null;
};

const fetchFieldRemoveCommands = async (
  spectacle: IForkableSpectacle,
  fieldId: string
): Promise<CQRSCommand[]> => {
  try {
    const results = await spectacle.query<
      FieldCommands,
      {
        fieldId: string;
      }
    >({
      query: `
      query X($fieldId: ID!) {
        field(fieldId: $fieldId) {
          commands {
            remove
          }
        }
      }`,
      variables: {
        fieldId,
      },
    });
    if (results.errors) {
      console.error(results.errors);
      throw new Error(JSON.stringify(results.errors));
    }
    if (!results.data || !results.data.field) {
      const message = `Could not generate removal commands for field: ${fieldId}`;
      console.error(message);
      throw new Error(message);
    }
    return results.data.field.commands.remove;
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
