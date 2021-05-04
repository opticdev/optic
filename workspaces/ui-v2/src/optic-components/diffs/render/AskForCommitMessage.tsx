import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { CommitMessageModal } from '../../common';

import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { useSpectacleCommand } from '../../../spectacle-implementations/spectacle-provider';
import { useLastBatchCommitId } from '../../hooks/useBatchCommits';
import { useChangelogPages } from '../../navigation/Routes';
<<<<<<< HEAD
import { v4 as uuidv4 } from 'uuid';

const useStagedChangesCount = () => {
  const { pendingEndpoints, context } = useSharedDiffContext();

  const pendingEndpointsCount = pendingEndpoints.filter((i) => i.staged).length;
  const diffHashToEndpoint = context.results.diffsGroupedByEndpoint.reduce(
    (acc: { [diffHash: string]: string }, endpoint) => {
      const endpointId = `${endpoint.pathId}.${endpoint.method}`;
      endpoint.shapeDiffs.forEach((shapeDiff) => {
        acc[shapeDiff.diffHash()] = endpointId;
      });
      return acc;
    },
    {}
  );
  const changedEndpointsCount = new Set([
    ...Object.keys(context.choices.approvedSuggestions).map(
      (diffHash) => diffHashToEndpoint[diffHash]
    ),
    ...Object.keys(context.choices.existingEndpointNameContributions),
    ...Object.values(context.choices.existingEndpointPathContributions).map(
      (pathContribution) => pathContribution.endpointId
    ),
  ]).size;

  return {
    pendingEndpointsCount,
    changedEndpointsCount,
  };
};
=======
import { useAnalytics } from '../../../analytics';
>>>>>>> 7fbccaf63 (added basic analytics to frontend)

export default function AskForCommitMessageDiffPage(props: {
  hasChanges: boolean;
}) {
  const [open, setOpen] = useState(false);
  const spectacleMutator = useSpectacleCommand();
  const history = useHistory();
  const lastBatchCommitId = useLastBatchCommitId();
  const changelogPageRoute = useChangelogPages();
  const analytics = useAnalytics();

  const { context, startedFinalizing } = useSharedDiffContext();

  const {
    pendingEndpointsCount,
    changedEndpointsCount,
  } = useStagedChangesCount();

<<<<<<< HEAD
  const handleSave = async (commitMessage: string) => {
=======
  const handleSave = async () => {
    analytics.userSavedChanges(
      pendingEndpointsCount,
      Object.keys(context.choices.approvedSuggestions).length,
      Object.keys(context.choices.existingEndpointNameContributions).length +
        pendingEndpoints.filter(
          (i) => i.staged && i.ref.context.stagedEndpointName
        ).length
    );

    // TODO figure out how to attach a commit message to match id
>>>>>>> 7fbccaf63 (added basic analytics to frontend)
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
}`,
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
    // @nic TODO we need to trigger a new full page refresh - or trigger a refetch of data through out queries
  };

  return (
    <>
      <Button
        disabled={!props.hasChanges}
        onClick={() => {
          setOpen(true);
          startedFinalizing();
        }}
        size="small"
        variant="contained"
        color="primary"
      >
        Save Changes
      </Button>
      <CommitMessageModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        dialogText={`You have added ${pendingEndpointsCount} new ${
          pendingEndpointsCount === 1 ? 'endpoint' : 'endpoints'
        } and updated ${changedEndpointsCount} existing ${
          changedEndpointsCount === 1 ? 'endpoint' : 'endpoints'
        }.`}
      />
    </>
  );
}
