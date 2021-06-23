import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { v4 as uuidv4 } from 'uuid';
import { CommitMessageModal } from '<src>/components';

import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { useSpectacleCommand } from '<src>/contexts/spectacle-provider';
import { useLastBatchCommitId } from '<src>/hooks/useBatchCommits';
import {
  useChangelogPages,
  useDocumentationPageLink,
} from '<src>/components/navigation/Routes';
import { PromptNavigateAway } from '<src>/components';
import { useAnalytics } from '<src>/contexts/analytics';
import { useAppSelector } from '<src>/store';

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
  const specId = useAppSelector(
    (state) => state.metadata.data?.specificationId!
  );
  const clientId = useAppSelector((state) => state.metadata.data?.clientAgent!);
  const clientSessionId = useAppSelector(
    (state) => state.metadata.data?.sessionId!
  );
  const documentationPageRoute = useDocumentationPageLink();

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
    const commands = context.simulatedCommands;
    try {
      await spectacleMutator<any, any>({
        query: `
        mutation X($commands: [JSON!]!, $batchCommitId: ID!, $commitMessage: String!, $clientId: ID!, $clientSessionId: ID!) {
    applyCommands(commands: $commands, batchCommitId: $batchCommitId, commitMessage: $commitMessage, clientId: $clientId, clientSessionId: $clientSessionId) {
      batchCommitId
    }
  }`,
        variables: {
          commands,
          batchCommitId: uuidv4(),
          commitMessage: commitMessage,
          clientId,
          clientSessionId,
        },
      });
      analytics.userSavedChanges(
        pendingEndpointsCount,
        changedEndpointsCount,
        specId
      );

      if (lastBatchCommitId) {
        history.push(changelogPageRoute.linkTo(lastBatchCommitId));
      } else {
        history.push(documentationPageRoute.linkTo());
      }
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
      {commitModalOpen ? (
        <CommitMessageModal
          onClose={() => setCommitModalOpen(false)}
          onSave={handleSave}
          dialogText={`You have added ${pendingEndpointsCount} new ${
            pendingEndpointsCount === 1 ? 'endpoint' : 'endpoints'
          } and updated ${changedEndpointsCount} existing ${
            changedEndpointsCount === 1 ? 'endpoint' : 'endpoints'
          }.`}
        />
      ) : (
        <PromptNavigateAway shouldPrompt={props.hasChanges} />
      )}
    </>
  );
}
