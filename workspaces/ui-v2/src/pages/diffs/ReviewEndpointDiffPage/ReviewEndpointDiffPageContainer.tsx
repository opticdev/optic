import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router';
import { LinearProgress } from '@material-ui/core';
import { useEndpointDiffs } from '<src>/pages/diffs/hooks/useEndpointDiffs';
import {
  useNewBodyDiffInterpretations,
  useShapeDiffInterpretations,
} from '<src>/pages/diffs/hooks/useDiffInterpretations';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { PageLayout } from '<src>/components';
import { DiffAccessoryNavigation } from '<src>/pages/diffs/components/DiffAccessoryNavigation';
import { useAppSelector, selectors } from '<src>/store';

import { ReviewEndpointDiffPage } from './ReviewEndpointDiffPage';

export const ReviewEndpointDiffContainer: FC<
  RouteComponentProps<{
    method: string;
    pathId: string;
  }>
> = ({ match }) => {
  const { method, pathId } = match.params;

  const endpointDiffs = useEndpointDiffs(pathId, method);
  const endpoint = useAppSelector(selectors.getEndpoint({ pathId, method }));
  const { context } = useSharedDiffContext();

  const shapeDiffs = useShapeDiffInterpretations(
    endpointDiffs.shapeDiffs,
    context.results.trailValues
  );

  const newRegionDiffs = useNewBodyDiffInterpretations(
    endpointDiffs.newRegionDiffs
  );

  return (
    <PageLayout AccessoryNavigation={DiffAccessoryNavigation}>
      {!endpoint || shapeDiffs.loading || newRegionDiffs.loading ? (
        <LinearProgress variant="indeterminate" />
      ) : (
        <ReviewEndpointDiffPage
          endpoint={endpoint}
          allDiffs={[...newRegionDiffs.results, ...shapeDiffs.results]}
          method={method}
          pathId={pathId}
        />
      )}
    </PageLayout>
  );
};
