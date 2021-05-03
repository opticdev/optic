import React, { FC, useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import { IForkableSpectacle } from '@useoptic/spectacle';

import { useEndpointDiffs } from '<src>/optic-components/hooks/diffs/useEndpointDiffs';
import { useShapeDiffInterpretations } from '<src>/optic-components/hooks/diffs/useDiffInterpretations';
import { useSharedDiffContext } from '<src>/optic-components/hooks/diffs/SharedDiffContext';
import { useEndpoint } from '<src>/optic-components/hooks/useEndpointsHook';
import { SpectacleContext } from '<src>/spectacle-implementations/spectacle-provider';
import { Loading } from '<src>/optic-components/loaders/Loading';

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

  return !endpoint || shapeDiffs.loading ? (
    <Loading />
  ) : (
    <ReviewEndpointDiffPage
      endpoint={endpoint}
      shapeDiffs={shapeDiffs.results}
      spectacle={spectacle as IForkableSpectacle}
      method={method}
      pathId={pathId}
    />
  );
};
