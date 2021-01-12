import React, { useContext, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { useHistory } from 'react-router-dom';
import uuidv4 from 'uuid/v4';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import { IgnoreDiffContext, SuggestionsContext } from './DiffPageNew';
import { TextField } from '@material-ui/core';
import { UserCommittedChanges } from '@useoptic/analytics/lib/events/diffs';
import {
  Facade,
  JsonHelper,
  opticEngine,
  RfcCommandContext,
} from '@useoptic/domain';
import { RfcContext } from '../../../contexts/RfcContext';
import { useServices } from '../../../contexts/SpecServiceContext';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import { DiffContext } from './DiffContext';
import { EndpointsContext } from '../../../contexts/EndpointContext';
import { PathAndMethod } from './PathAndMethod';
import { PURPOSE } from '../../../ContributionKeys';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FinalizeDialog(props) {
  const { open, close, canOnlyReset, captureId } = props;
  const [commitMessage, setCommitMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const { acceptedSuggestions } = useContext(SuggestionsContext);
  const { ignoredDiffs } = useContext(IgnoreDiffContext);
  const { endpointDescriptor, endpointId } = useContext(EndpointsContext);
  const [endpointName, setEndpointName] = useState(
    endpointDescriptor.endpointPurpose
  );
  const { specService } = useServices();
  const { reset } = useContext(DiffContext);
  const baseUrl = useBaseUrl();

  const history = useHistory();

  const { initialEventStore, rfcId, clientSessionId, clientId } = useContext(
    RfcContext
  );

  const backToHome = () => {
    history.push(`${baseUrl}/diffs/${captureId}`);
  };
  const commit = async () => {
    const newEventStore = initialEventStore.getCopy(rfcId);
    const {
      StartBatchCommit,
      EndBatchCommit,
      AddContribution,
    } = opticEngine.com.useoptic.contexts.rfc.Commands;
    const batchId = uuidv4();
    const specContext = withSpecContext(
      newEventStore,
      rfcId,
      clientId,
      clientSessionId
    );
    specContext.applyCommands(
      JsonHelper.jsArrayToVector([StartBatchCommit(batchId, commitMessage)])
    );

    //user specified a new name for th endpoint
    if (endpointDescriptor.endpointPurpose !== endpointName) {
      const addContribution = AddContribution(
        endpointId,
        PURPOSE,
        endpointName
      );
      specContext.applyCommands(JsonHelper.jsArrayToVector([addContribution]));
    }

    acceptedSuggestions.forEach((suggestion) => {
      specContext.applyCommands(JsonHelper.seqToVector(suggestion.commands));
    });
    specContext.applyCommands(
      JsonHelper.jsArrayToVector([EndBatchCommit(batchId)])
    );
    await specService.saveEvents(newEventStore, rfcId);

    history.push(`${baseUrl}/diffs/${captureId}`);

    // Delay sending commit event to ensure that event happens after switch to diffs page
    // neccesary for demo flow
    // TODO: Switch demo implementation to use better state machine to mitigate this problem
    setTimeout(() => {
      // trackUserEvent(
      //   UserCommittedChanges.withProps({
      //     message: commitMessage,
      //     captureId,
      //     suggestions: acceptedSuggestions.length,
      //   })
      // );
    }, 500);
  };

  useEffect(() => {
    const pastTenseChanges = acceptedSuggestions
      .map((i) => `- ${i.pastTenseAction}`)
      .join('\n');
    setCommitMessage(`\n\nChanges:\n${pastTenseChanges}`);
  }, [open, acceptedSuggestions.length, ignoredDiffs.length]);

  const pluralIf = (collection) => (collection.length !== 1 ? 's' : '');
  const pluralIfI = (i) => (i !== 1 ? 's' : '');

  const hasChanges = acceptedSuggestions.length > 0;
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={close}
    >
      <DialogTitle>{'Commit changes to API specification'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {!endpointDescriptor.endpointPurpose && hasChanges ? (
            <div style={{ paddingBottom: 18 }}>
              <PathAndMethod
                path={endpointDescriptor.fullPath}
                method={endpointDescriptor.httpMethod}
              />
              <TextField
                style={{ marginTop: 12 }}
                value={endpointName}
                onChange={(e) => setEndpointName(e.target.value)}
                placeholder="Endpoint Name"
                fullWidth
                error={!endpointName}
                helperText={!endpointName && 'What does this endpoint do?'}
                required
              />
            </div>
          ) : null}
          You have accepted {acceptedSuggestions.length} suggestion
          {pluralIf(acceptedSuggestions)}, and ignored {ignoredDiffs.length}{' '}
          diff{pluralIf(ignoredDiffs)}
          {hasChanges && (
            <TextField
              multiline
              label="Commit Message:"
              style={{ marginTop: 15 }}
              value={commitMessage}
              fullWidth
              autoFocus
              onFocus={(e) => e.currentTarget.setSelectionRange(0, 0)}
              onChange={(e) => setCommitMessage(e.target.value)}
            />
          )}
        </DialogContentText>
      </DialogContent>
      {!hasChanges && (
        <DialogActions>
          <Button size="small" onClick={backToHome}>
            Return to Capture
          </Button>
        </DialogActions>
      )}
      {saving && <LinearProgress variant="indeterminate" />}
      {hasChanges && !saving && (
        <DialogActions>
          {canOnlyReset ? (
            <Button size="small" onClick={reset} color="default">
              Reset
            </Button>
          ) : (
            <Button size="small" onClick={close} color="default">
              Close
            </Button>
          )}
          <Button
            size="small"
            variant="contained"
            disabled={!endpointName}
            onClick={async () => {
              setSaving(true);
              await commit();
            }}
            color="primary"
          >
            Commit Changes
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

export function withSpecContext(eventStore, rfcId, clientId, clientSessionId) {
  return {
    applyCommands(commands) {
      try {
        const batchId = uuidv4();
        const commandContext = new RfcCommandContext(
          clientId,
          clientSessionId,
          batchId
        );
        Facade.fromCommands(eventStore, rfcId, commands, commandContext);
      } catch (e) {
        console.error(e);
      }
    },
  };
}
