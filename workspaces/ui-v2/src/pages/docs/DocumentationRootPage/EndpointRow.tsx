import React, { FC, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  IconButton,
  makeStyles,
  ListItem,
  Tooltip,
  darken,
} from '@material-ui/core';
import { Delete as DeleteIcon, Undo as UndoIcon } from '@material-ui/icons';

import { RemovedRedBackground } from '<src>/constants/theme';
import { useFeatureFlags } from '<src>/contexts/config/AppConfiguration';
import { EndpointName } from '<src>/components';
import { IEndpoint } from '<src>/types';
import { getEndpointId } from '<src>/utils';

import { useContributionEditing } from '../contexts/Contributions';
import {
  DeleteEndpointConfirmationModal,
  EndpointNameMiniContribution,
} from '../components';

type EndpointRowProps = {
  endpoint: IEndpoint;
};

export const EndpointRow: FC<EndpointRowProps> = ({ endpoint }) => {
  const history = useHistory();
  const match = useRouteMatch();
  const classes = useStyles();
  const endpointId = getEndpointId({
    method: endpoint.method,
    pathId: endpoint.pathId,
  });
  const { isEditing } = useContributionEditing();
  const { showDeleteEndpointUi } = useFeatureFlags();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // TODO replace this with redux selector query
  const isEndpointStagedForDeletion =
    endpoint.pathId.slice(-1).charCodeAt(0) % 2 === 0;

  const deleteEndpoint = (endpointId: string) => {
    // TODO implement
  };

  const undeleteEndpoint = (endpointId: string) => {
    // TODO implement
  };

  return (
    <>
      {deleteModalOpen && (
        <DeleteEndpointConfirmationModal
          endpoint={endpoint}
          handleClose={() => setDeleteModalOpen(false)}
          handleConfirm={() => {
            deleteEndpoint(endpointId);
            setDeleteModalOpen(false);
          }}
        />
      )}
      <ListItem
        button
        disableRipple
        disableGutters
        style={{ display: 'flex' }}
        className={
          isEditing && isEndpointStagedForDeletion ? classes.deleted : ''
        }
        onClick={() =>
          !isEndpointStagedForDeletion &&
          history.push(
            `${match.url}/paths/${endpoint.pathId}/methods/${endpoint.method}`
          )
        }
      >
        <div style={{ flex: 1 }}>
          <EndpointName
            method={endpoint.method}
            fullPath={endpoint.fullPath}
            leftPad={6}
          />
        </div>
        <div
          className={classes.contributionsContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <EndpointNameMiniContribution
            id={endpointId}
            defaultText="name for this endpoint"
            contributionKey="purpose"
            initialValue={endpoint.purpose}
          />
          {isEditing && showDeleteEndpointUi && (
            <div>
              {isEndpointStagedForDeletion ? (
                <Tooltip title="Unstage endpoint deletion">
                  <IconButton
                    onClick={() => {
                      undeleteEndpoint(endpointId);
                    }}
                  >
                    <UndoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Delete this endpoint">
                  <IconButton
                    onClick={() => {
                      setDeleteModalOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </ListItem>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  contributionsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  deleted: {
    backgroundColor: RemovedRedBackground,
    cursor: 'default',
    '&.Mui-focusVisible, &:hover': {
      backgroundColor: darken(RemovedRedBackground, 0.2),
    },
  },
}));
