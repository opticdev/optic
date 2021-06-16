import React from 'react';
import { useHistory } from 'react-router-dom';
import { ToggleButton } from '@material-ui/lab';
import { Typography, makeStyles } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import EditIcon from '@material-ui/icons/Edit';

import { CommitMessageModal } from '<src>/components';
import { useAnalytics } from '<src>/contexts/analytics';
import { useDocumentationPageLink } from '<src>/components/navigation/Routes';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import {
  useAppSelector,
  useAppDispatch,
  documentationEditActions,
  selectors,
} from '<src>/store';

export function EditContributionsButton() {
  const classes = useStyles();
  const history = useHistory();
  const documentationPageRoute = useDocumentationPageLink();
  const spectacle = useSpectacleContext();
  const analytics = useAnalytics();

  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const specId = useAppSelector(
    (state) => state.metadata.data?.specificationId!
  );
  const commitModalOpen = useAppSelector(
    (state) => state.documentationEdits.commitModalOpen
  );
  const pendingCount = useAppSelector(
    selectors.getDocumentationEditStagedCount
  );
  const deletedEndpointCount = useAppSelector(
    (state) => state.documentationEdits.deletedEndpoints.length
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
    // If we are on endpoint root page and we just deleted the page, we want to redirect
    const shouldRedirect =
      deletedEndpointCount > 0 &&
      history.location.pathname !== documentationPageRoute.path;
    dispatch(
      documentationEditActions.saveDocumentationChanges({
        spectacle,
        commitMessage,
      })
    )
      .then(() => {
        analytics.userSavedDocChanges(
          deletedEndpointCount,
          pendingCount - deletedEndpointCount,
          specId
        );
        if (shouldRedirect) {
          history.push(documentationPageRoute.linkTo());
        }
      })
      .catch((e) => {
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
