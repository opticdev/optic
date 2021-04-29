import React, { ChangeEvent, FC, useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
} from '@material-ui/core';

type CommitMessageModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (commitMessage: string) => void;
  dialogText: string;
};

export const CommitMessageModal: FC<CommitMessageModalProps> = ({
  open,
  onClose,
  onSave,
  dialogText,
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
      PaperProps={{
        className: classes.dialogContainer,
      }}
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
          disabled={commitMessage.length === 0}
          onClick={() => {
            onSave(commitMessage);
            onClose();
          }}
          color="primary"
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
