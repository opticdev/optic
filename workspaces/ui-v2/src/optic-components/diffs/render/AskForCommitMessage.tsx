import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { CommitMessageModal } from '../../common';

import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { useSpectacleCommand } from '../../../spectacle-implementations/spectacle-provider';
import { useLastBatchCommitId } from '../../hooks/useBatchCommits';
import { useChangelogPages } from '../../navigation/Routes';

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
  const [open, setOpen] = useState(false);
  const spectacleMutator = useSpectacleCommand();
  const history = useHistory();
  const lastBatchCommitId = useLastBatchCommitId();
  const changelogPageRoute = useChangelogPages();

  const { context, startedFinalizing } = useSharedDiffContext();

  const {
    pendingEndpointsCount,
    changedEndpointsCount,
  } = useStagedChangesCount();

  const handleSave = async (commitMessage: string) => {
    const commands = context.simulatedCommands;
    const {
      data: {
        applyCommands: { batchCommitId },
      },
    } = await spectacleMutator({
      query: `
      mutation X($commands: [JSON], $commitMessage: String) {
        applyCommands(commands: $commands, commitMessage: $commitMessage) {
          batchCommitId
        }
      }
      `,
      variables: {
        commands,
        commitMessage,
      },
    });
    // If there are no batch commits (first commit) - link to the just created commit
    history.push(changelogPageRoute.linkTo(lastBatchCommitId || batchCommitId));
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
