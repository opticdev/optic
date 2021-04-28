import React, { FC, useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import { IForkableSpectacle } from '@useoptic/spectacle';

import { useEndpointDiffs } from '../../../hooks/diffs/useEndpointDiffs';
import { useShapeDiffInterpretations } from '../../../hooks/diffs/useDiffInterpretations';
import { useSharedDiffContext } from '../../../hooks/diffs/SharedDiffContext';
import { useEndpoint } from '../../../hooks/useEndpointsHook';
import { SpectacleContext } from '../../../../spectacle-implementations/spectacle-provider';

import { ReviewEndpointDiffPage } from './ReviewEndpointDiffPage';

export const ReviewEndpointDiffContainer: FC<
  RouteComponentProps<{
    method: string;
    pathId: string;
  }>
> = ({ match }) => {
  const { method, pathId } = match.params;

  const spectacle = useContext(SpectacleContext)!;

  // const lastBatchCommitId = useLastBatchCommitId();
  const endpointDiffs = useEndpointDiffs(pathId, method);
  const endpoint = useEndpoint(pathId, method);
  const { context } = useSharedDiffContext();

  const shapeDiffs = useShapeDiffInterpretations(
    endpointDiffs.shapeDiffs,
    context.results.trailValues
  );

  //
  // const newBodyDiffs = useNewBodyDiffInterpretations(
  //   endpointDiffs.newRegionDiffs,
  // );

  return !endpoint || shapeDiffs.loading ? (
    // @nic todo add in this loading state
    <div>TODO loading state</div>
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
