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
import { EndpointName } from '<src>/components';
import { IEndpoint } from '<src>/types';
import { getEndpointId } from '<src>/utils';

import {
  DeleteEndpointConfirmationModal,
  EndpointNameMiniContribution,
} from '../components';
import {
  useAppSelector,
  useAppDispatch,
  selectors,
  documentationEditActions,
} from '<src>/store';

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
  const dispatch = useAppDispatch();
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const showDeleteEndpointUi =
    process.env.REACT_APP_FF_SHOW_DELETE_ENDPOINT === 'true';
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const isEndpointStagedForDeletion = useAppSelector(
    selectors.isEndpointDeleted({
      method: endpoint.method,
      pathId: endpoint.pathId,
    })
  );

  const deleteEndpoint = () =>
    dispatch(
      documentationEditActions.deleteEndpoint({
        method: endpoint.method,
        pathId: endpoint.pathId,
      })
    );

  const undeleteEndpoint = () =>
    dispatch(
      documentationEditActions.undeleteEndpoint({
        method: endpoint.method,
        pathId: endpoint.pathId,
      })
    );

  return (
    <>
      {deleteModalOpen && (
        <DeleteEndpointConfirmationModal
          endpoint={endpoint}
          handleClose={() => setDeleteModalOpen(false)}
          handleConfirm={() => {
            deleteEndpoint();
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
            endpoint={{
              method: endpoint.method,
              pathId: endpoint.pathId,
            }}
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
                      undeleteEndpoint();
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
