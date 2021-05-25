import React, { FC, useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import { IForkableSpectacle } from '@useoptic/spectacle';

import { useEndpointDiffs } from '<src>/optic-components/hooks/diffs/useEndpointDiffs';
import {
  useNewBodyDiffInterpretations,
  useShapeDiffInterpretations,
} from '<src>/optic-components/hooks/diffs/useDiffInterpretations';
import { useSharedDiffContext } from '<src>/optic-components/hooks/diffs/SharedDiffContext';
import { useEndpoint } from '<src>/optic-components/hooks/useEndpointsHook';
import { SpectacleContext } from '<src>/spectacle-implementations/spectacle-provider';
import { Loading } from '<src>/optic-components/loaders/Loading';
import { PageLayout } from '<src>/optic-components/layouts/PageLayout';
import { DiffAccessoryNavigation } from '<src>/optic-components/diffs/DiffAccessoryNavigation';

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
