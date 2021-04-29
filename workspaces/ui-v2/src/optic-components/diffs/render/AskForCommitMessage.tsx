import React from 'react';
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
  const diffHashToEndpoint: {
    [diffHash: string]: string;
  } = context.results.diffsGroupedByEndpoint.reduce(
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
  ]).size;

  return {
    pendingEndpointsCount,
    changedEndpointsCount,
  };
};

export default function AskForCommitMessageDiffPage(props: {
  hasChanges: boolean;
}) {
  const [open, setOpen] = React.useState(false);
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
      mutation X($commands: [JSON]) {
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
