import React from 'react';
import { ToggleButton } from '@material-ui/lab';
import { Typography, makeStyles } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import EditIcon from '@material-ui/icons/Edit';

import { CommitMessageModal } from '<src>/components';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import {
  useAppSelector,
  useAppDispatch,
  documentationEditActions,
  selectors,
} from '<src>/store';

export function EditContributionsButton() {
  const classes = useStyles();
  const spectacle = useSpectacleContext();

  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const commitModalOpen = useAppSelector(
    (state) => state.documentationEdits.commitModalOpen
  );
  const pendingCount = useAppSelector(
    selectors.getDocumentationEditStagedCount
  );
  const dispatch = useAppDispatch();

  const setCommitModalOpen = (commitModalOpen: boolean) => {
    dispatch(
      documentationEditActions.updateCommitModalState({
        commitModalOpen,
      })
    );
  };
  const setEditing = (isEditing: boolean) => {
    dispatch(
      documentationEditActions.updateEditState({
        isEditing,
      })
    );
  };

  const save = (commitMessage: string) => {
    dispatch(
      documentationEditActions.saveDocumentationChanges({
        spectacle,
        commitMessage,
      })
    ).catch((e) => {
      // TODO handle error state
      console.error(e);
    });
  };

  const contents = !isEditing ? (
    <>
      <Typography variant="body2" style={{ textTransform: 'none' }}>
        Edit
      </Typography>
      <EditIcon style={{ marginLeft: 3, height: 14 }} />
    </>
  ) : (
    <>
      <Typography variant="body2" style={{ textTransform: 'none' }}>
        {pendingCount === 0 ? 'Finish' : `Save (${pendingCount})`}
      </Typography>
      <SaveAltIcon color="secondary" style={{ marginLeft: 3, height: 14 }} />
    </>
  );
  return (
    <>
      <ToggleButton
        value="check"
        selected={isEditing}
        onClick={() => {
          isEditing
            ? pendingCount > 0
              ? setCommitModalOpen(true)
              : setEditing(false)
            : setEditing(true);
        }}
        size="small"
        className={classes.button}
      >
        {contents}
      </ToggleButton>
      {commitModalOpen && (
        <CommitMessageModal
          onClose={() => setCommitModalOpen(false)}
          onSave={async (commitMessage: string) => {
            save(commitMessage);
            setCommitModalOpen(false);
          }}
          dialogText={`You have ${pendingCount} ${
            pendingCount === 1 ? 'change' : 'changes'
          }.`}
        />
      )}
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    height: 25,
    paddingRight: 5,
  },
  scroll: {
    overflow: 'scroll',
    flex: 1,
  },
}));
