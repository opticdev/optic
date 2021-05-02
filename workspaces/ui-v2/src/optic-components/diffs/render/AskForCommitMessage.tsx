import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { useSpectacleCommand } from '../../../spectacle-implementations/spectacle-provider';
import { useLastBatchCommitId } from '../../hooks/useBatchCommits';
import { useChangelogPages } from '../../navigation/Routes';
import { v4 as uuidv4 } from 'uuid';

export default function AskForCommitMessage(props: { hasChanges: boolean }) {
  const [open, setOpen] = React.useState(false);
  const spectacleMutator = useSpectacleCommand();
  const history = useHistory();
  const lastBatchCommitId = useLastBatchCommitId();
  const changelogPageRoute = useChangelogPages();

  const {
    pendingEndpoints,
    context,
    startedFinalizing,
  } = useSharedDiffContext();

  const [commitMessage, setCommitMessage] = useState<string>('');
  const handleClickOpen = () => {
    setOpen(true);
    startedFinalizing();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const pendingEndpointsCount = pendingEndpoints.filter((i) => i.staged).length;

  const handleSave = async () => {
    const commands = context.simulatedCommands;
    const {
      data: {
        applyCommands: { batchCommitId },
      },
    } = await spectacleMutator({
      query: `
      mutation X($commands: [JSON], $batchCommitId: ID, $commitMessage: String, $clientId: ID, $clientSessionId: ID) {
  applyCommands(commands: $commands, batchCommitId: $batchCommitId, commitMessage: $commitMessage, clientId: $clientId, clientSessionId: $clientSessionId) {
    batchCommitId
  }
}
      `,
      variables: {
        commands,
        batchCommitId: uuidv4(),
        commitMessage: commitMessage,
        clientId: uuidv4(), //@dev: fill this in
        clientSessionId: uuidv4(), //@dev: fill this in
      },
    });
    // If there are no batch commits (first commit) - link to the just created commit
    history.push(changelogPageRoute.linkTo(lastBatchCommitId || batchCommitId));
    // @nic TODO we need to trigger a new full page refresh - or trigger a refetch of data through out queries. i believe if we "invalidate" the spectacle instance then all the spectacle-consuming hooks will requery. that is why the specRepository exposes its change event
  };

  return (
    <>
      <Button
        disabled={!props.hasChanges}
        onClick={handleClickOpen}
        size="small"
        variant="contained"
        color="primary"
      >
        Save Changes
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          Save Changes to Specification
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have added {pendingEndpointsCount} new endpoint
            {pendingEndpointsCount === 1 ? '' : 's'} and updated 6 existing
            endpoints.
          </DialogContentText>
          <TextField
            value={commitMessage}
            onChange={(e: any) => setCommitMessage(e.target.value)}
            placeholder="what changes have you made? why?"
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="default">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
