import React, { FC, useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { EndpointName, SpinningOpticLogo } from '<src>/components';

import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { IUndocumentedUrl } from '<src>/pages/diffs/contexts/SharedDiffState';
import { makePattern } from '../utils';

type BulkLearnModalProps = {
  undocumentedEndpointsToLearn: IUndocumentedUrl[];
  closeModal: () => void;
};

const LearningProgress: FC<{
  pendingEndpointIds: Set<string>;
  closeModal: BulkLearnModalProps['closeModal'];
}> = ({ pendingEndpointIds, closeModal }) => {
  const { stageEndpoint, context } = useSharedDiffContext();
  const refStageEndpoint = useRef(stageEndpoint);

  // @nic TODO handle when learning fails! - currently the modal just gets stuck :(
  const learningPendingEndpoints = context.pendingEndpoints.filter(
    (pendingEndpoint) => pendingEndpointIds.has(pendingEndpoint.id)
  );
  const completedCount = learningPendingEndpoints.filter((pendingEndpoint) =>
    pendingEndpoint.ref.state.matches('ready')
  ).length;
  const totalCount = learningPendingEndpoints.length;

  // Stage endpoints and close modal when we've completed all
  useEffect(() => {
    if (completedCount === totalCount) {
      for (const pendingId of pendingEndpointIds) {
        refStageEndpoint.current(pendingId);
      }
      closeModal();
    }
  }, [completedCount, totalCount, pendingEndpointIds, closeModal]);

  // This is a lie since we have no guarantee these are learnt in order
  // But it's nice to give visual feedback to users and see some progress happening
  const currentlyProcessingEndpoint =
    learningPendingEndpoints[Math.min(completedCount, totalCount - 1)];

  return (
    <Box display="flex">
      <Box display="flex" padding="0 8px" alignItems="center">
        <SpinningOpticLogo />
      </Box>
      <Box width="100%" paddingRight="16px">
        Learning endpoint ({Math.min(completedCount + 1, totalCount)}/
        {totalCount}):{' '}
        <EndpointName
          method={currentlyProcessingEndpoint.method}
          leftPad={0}
          fontSize={12}
          fullPath={currentlyProcessingEndpoint.pathPattern}
        />
        <LinearProgress variant="indeterminate" />
      </Box>
    </Box>
  );
};

export const BulkLearnModal: FC<BulkLearnModalProps> = ({
  undocumentedEndpointsToLearn,
  closeModal,
}) => {
  const { documentEndpoint, wipPatterns } = useSharedDiffContext();
  const endpointsAsPatterns = undocumentedEndpointsToLearn.map(
    ({ path, method }) => {
      // For selectedUrls, unspecified selected urls will not be
      // in wipPatterns
      const pattern = wipPatterns[path + method]
        ? makePattern(wipPatterns[path + method].components)
        : path;
      return { pattern, method };
    }
  );
  const [learningInfo, setLearningInfo] = useState<{
    pendingEndpointIds: Set<string>;
  } | null>(null);

  const learnEndpoints = () => {
    const pendingEndpointIds = endpointsAsPatterns.map(({ pattern, method }) =>
      documentEndpoint(pattern, method)
    );
    setLearningInfo({
      pendingEndpointIds: new Set(pendingEndpointIds),
    });
  };

  return (
    <Dialog open={true}>
      <DialogTitle>Learn endpoints</DialogTitle>
      <Box padding="0px 8px 24px" minWidth="500px">
        <DialogContent>
          {learningInfo ? (
            <LearningProgress
              pendingEndpointIds={learningInfo.pendingEndpointIds}
              closeModal={closeModal}
            />
          ) : (
            <Box display="flex" flexDirection="column" padding="0">
              <Typography
                style={{
                  fontFamily: 'Ubuntu Mono',
                  marginBottom: 14,
                }}
              >
                Endpoints to learn
              </Typography>
              <Box overflow="auto" maxHeight="50vh">
                {endpointsAsPatterns.map(({ pattern, method }) => (
                  <EndpointName
                    key={pattern}
                    method={method}
                    fontSize={12}
                    fullPath={pattern}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        {!learningInfo && (
          <DialogActions>
            <Button onClick={closeModal}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={learnEndpoints}
            >
              Learn
            </Button>
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
};
