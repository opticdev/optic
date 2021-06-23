import React, { ChangeEvent, FC, useState } from 'react';
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';
import { Button } from '<src>/components';
import { useRunOnKeypress } from '<src>/hooks/util';

type CommitMessageModalProps = {
  onClose: () => void;
  onSave: (commitMessage: string) => Promise<void>;
  dialogText: string;
};

export const CommitMessageModal: FC<CommitMessageModalProps> = ({
  onClose,
  onSave,
  dialogText,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const classes = useStyles();
  const canSubmit = commitMessage.length > 0;
  const onKeyPress = useRunOnKeypress(
    () => {
      if (canSubmit) {
        onSave(commitMessage);
      }
    },
    {
      keys: new Set(['Enter']),
      inputTagNames: new Set(['input']),
    }
  );

  return (
    <Dialog
      open={true}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        className: classes.dialogContainer,
      }}
      onKeyPress={onKeyPress}
    >
      <DialogTitle id="form-dialog-title">
        Save Changes to Specification
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{dialogText}</DialogContentText>
        <TextField
          value={commitMessage}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCommitMessage(e.target.value)
          }
          placeholder="what changes have you made? why?"
          autoFocus
          margin="dense"
          label="Message"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>
        <Button
          disabled={!canSubmit || isSaving}
          onClick={async () => {
            setIsSaving(true);
            await onSave(commitMessage);
          }}
          color="primary"
          loading={isSaving}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles((theme) => ({
  dialogContainer: {
    width: '100%',
  },
}));
