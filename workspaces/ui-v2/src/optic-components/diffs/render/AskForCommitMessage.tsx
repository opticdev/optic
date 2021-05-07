import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { CommitMessageModal } from '../../common';

import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { useSpectacleCommand } from '../../../spectacle-implementations/spectacle-provider';
import { useLastBatchCommitId } from '../../hooks/useBatchCommits';
import { useChangelogPages } from '../../navigation/Routes';
import { v4 as uuidv4 } from 'uuid';
import { useAnalytics } from '<src>/analytics';

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

export default function AskForCommitMessageDiffPage(props: {
  hasChanges: boolean;
}) {
  const spectacleMutator = useSpectacleCommand();
  const history = useHistory();
  const analytics = useAnalytics();
  const lastBatchCommitId = useLastBatchCommitId();
  const changelogPageRoute = useChangelogPages();

  const {
    context,
    startedFinalizing,
    commitModalOpen,
    setCommitModalOpen,
  } = useSharedDiffContext();

  const {
    pendingEndpointsCount,
    changedEndpointsCount,
  } = useStagedChangesCount();

  const handleSave = async (commitMessage: string) => {
    analytics.userSavedChanges(pendingEndpointsCount, changedEndpointsCount);
    const commands = context.simulatedCommands;
    try {
      const {
        applyCommands: { batchCommitId },
      } = await spectacleMutator<any, any>({
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
      history.push(
        changelogPageRoute.linkTo(lastBatchCommitId || batchCommitId)
      );
    } catch (e) {
      console.error(e);
      debugger;
    }
  };

  return (
    <>
      <Button
        disabled={!props.hasChanges}
        onClick={() => {
          setCommitModalOpen(true);
          startedFinalizing();
        }}
        size="small"
        variant="contained"
        color="primary"
      >
        Save Changes
      </Button>
      <CommitMessageModal
        open={commitModalOpen}
        onClose={() => setCommitModalOpen(false)}
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
