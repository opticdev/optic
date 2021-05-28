import React, { FC, useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import { IForkableSpectacle } from '@useoptic/spectacle';

import { useEndpointDiffs } from '<src>/pages/diffs/hooks/useEndpointDiffs';
import {
  useNewBodyDiffInterpretations,
  useShapeDiffInterpretations,
} from '<src>/pages/diffs/hooks/useDiffInterpretations';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { useEndpoint } from '<src>/hooks/useEndpointsHook';
import { SpectacleContext } from '<src>/contexts/spectacle-provider';
import { Loading, PageLayout } from '<src>/components';
import { DiffAccessoryNavigation } from '<src>/pages/diffs/components/DiffAccessoryNavigation';

import { ReviewEndpointDiffPage } from './ReviewEndpointDiffPage';

export const ReviewEndpointDiffContainer: FC<
  RouteComponentProps<{
    method: string;
    pathId: string;
  }>
> = ({ match }) => {
  const { method, pathId } = match.params;

  const spectacle = useContext(SpectacleContext)!;

  const endpointDiffs = useEndpointDiffs(pathId, method);
  const endpoint = useEndpoint(pathId, method);
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
      {!endpoint || shapeDiffs.loading ? (
        <Loading />
      ) : (
        <ReviewEndpointDiffPage
          endpoint={endpoint}
          allDiffs={[...newRegionDiffs.results, ...shapeDiffs.results]}
          spectacle={spectacle as IForkableSpectacle}
          method={method}
          pathId={pathId}
        />
      )}
    </PageLayout>
  );
};
