import React, { FC, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';
import * as Sentry from '@sentry/react';

import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { BatchCommit } from '<src>/hooks/useBatchCommits';
import { formatTimeAgo } from '<src>/utils';

type ConfirmResetModalProps = {
  onClose: () => void;
  batchCommit: BatchCommit;
};

export const ConfirmResetModal: FC<ConfirmResetModalProps> = ({
  onClose,
  batchCommit,
}) => {
  const spectacle = useSpectacleContext();
  const [isSaving, setIsSaving] = useState(false);
  const classes = useStyles();
  const onSave = async (batchCommitId: string) => {
    try {
      const results = await spectacle.mutate<{}, { batchCommitId: string }>({
        query: `
        mutation X(
          $batchCommitId: ID!
        ) {
          resetToCommit(batchCommitId: $batchCommitId)
        }
        `,
        variables: {
          batchCommitId,
        },
      });
      if (results.errors) {
        console.error(results.errors);
        throw new Error(JSON.stringify(results.errors));
      }
    } catch (e) {
      console.error(e);
      Sentry.captureException(e);
      throw e;
    }
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Reset to commit {batchCommit.batchId}</DialogTitle>
      <DialogContent>
        <h4 className={classes.commitDetailsHeader}>Details</h4>
        <div className={classes.commitDetails}>
          <p className={classes.commitMessage}>{batchCommit.commitMessage}</p>
          <p className={classes.commitTimeAgo}>
            {formatTimeAgo(new Date(batchCommit.createdAt))}
          </p>
        </div>
      </DialogContent>
      <DialogContent>
        This will hard reset your specification to this commit (there will be no
        history for this reset). Are you sure you want to continue?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>
        {/* TODO create button wrapper over material ui */}
        <Button
          disabled={isSaving}
          onClick={async () => {
            setIsSaving(true);
            await onSave(batchCommit.batchId);
            onClose();
          }}
          color="primary"
        >
          {isSaving ? (
            <CircularProgress style={{ marginLeft: 5 }} size={20} />
          ) : (
            'Confirm'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles((theme) => ({
  commitDetailsHeader: {
    marginTop: 0,
  },
  commitDetails: {
    borderLeft: `2px solid ${theme.palette.grey[300]}`,
    paddingLeft: theme.spacing(2),
  },
  commitMessage: {
    margin: 0,
  },
  commitTimeAgo: {
    margin: 0,
  },
}));
