import React, { useMemo } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  useDiffEnvironmentsRoot,
  useDiffForEndpointLink,
  useDiffReviewCapturePageLink,
  useDiffReviewPageLink,
  useDiffReviewPagePendingEndpoint,
  useDiffUndocumentedUrlsPageLink,
} from '../../navigation/Routes';
import { SharedDiffStore } from '../../hooks/diffs/SharedDiffContext';
import { PendingEndpointPageSession } from './PendingEndpointPage';
import { DiffUrlsPage } from './AddEndpointsPage';
import { ReviewEndpointDiffContainer } from './ReviewEndpointDiffPage';
import { useDiffsForCapture } from '../../hooks/useDiffForCapture';
import { v4 as uuidv4 } from 'uuid';
import { useAllRequestsAndResponses } from '../../hooks/diffs/useAllRequestsAndResponses';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import {
  CapturePageWithoutDiffOrRedirect,
  CapturePageWithDiff,
} from './CapturePage';
import { LoadingPage } from '../../loaders/Loading';
import { LoadingDiffReview } from '../../diffs/LoadingDiffReview';
import { usePaths } from '<src>/optic-components/hooks/usePathsHook';

export function DiffReviewPages(props: any) {
  const { match } = props;
  const { boundaryId } = match.params;
  const diffId = useMemo(() => uuidv4(), []);

  //dependencies
  const diff = useDiffsForCapture(boundaryId, diffId);
  const allRequestsAndResponsesOfBaseSpec = useAllRequestsAndResponses();
  const allEndpointsOfBaseSpec = useEndpoints();
  const allPaths = usePaths();

  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffReviewCapturePageLink = useDiffReviewCapturePageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  const isLoading =
    diff.loading ||
    allEndpointsOfBaseSpec.loading ||
    allPaths.loading ||
    allRequestsAndResponsesOfBaseSpec.loading;

  if (isLoading) {
    return (
      <LoadingPage>
        <LoadingDiffReview />
      </LoadingPage>
    );
  }

  return (
    <SharedDiffStore
      diffService={diff.data!.diffService}
      diffs={diff.data!.diffs}
      diffTrails={diff.data!.trails}
      urls={diff.data!.urls}
      captureId={boundaryId}
      endpoints={allEndpointsOfBaseSpec.endpoints}
      allPaths={allPaths.paths}
      requests={allRequestsAndResponsesOfBaseSpec.data?.requests!}
      responses={allRequestsAndResponsesOfBaseSpec.data?.responses!}
    >
      <Switch>
        <Route
          exact
          path={diffReviewCapturePageLink.path}
          component={CapturePageWithDiff}
        />
        <Route
          exact
          path={diffUndocumentedUrlsPageLink.path}
          component={DiffUrlsPage}
        />
        <Route
          exact
          path={diffForEndpointLink.path}
          component={ReviewEndpointDiffContainer}
        />
        <Route
          exact
          path={diffReviewPagePendingEndpoint.path}
          component={PendingEndpointPageSession}
        />
        <Redirect to={diffReviewCapturePageLink.linkTo()} />
      </Switch>
    </SharedDiffStore>
  );
}

export function DiffReviewEnvironments(props: any) {
  const diffRoot = useDiffReviewPageLink();
  const diffEnvironmentsRoot = useDiffEnvironmentsRoot();

  return (
    <Switch>
      <Route
        path={diffRoot.path}
        exact
        component={CapturePageWithoutDiffOrRedirect}
      />
      <Route path={diffEnvironmentsRoot.path} component={DiffReviewPages} />
    </Switch>
  );
}
