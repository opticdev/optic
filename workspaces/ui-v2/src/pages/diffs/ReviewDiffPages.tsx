import React, { useMemo } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  useDiffEnvironmentsRoot,
  useDiffForEndpointLink,
  useDiffReviewCapturePageLink,
  useDiffReviewPageLink,
  useDiffReviewPagePendingEndpoint,
  useDiffUndocumentedUrlsPageLink,
} from '<src>/components/navigation/Routes';
import { SharedDiffStore } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { PendingEndpointPageSession } from './PendingEndpointPage';
import { DiffUrlsPage } from './AddEndpointsPage';
import { ReviewEndpointDiffContainer } from './ReviewEndpointDiffPage';
import { useDiffsForCapture } from '<src>/pages/diffs/hooks/useDiffForCapture';
import { v4 as uuidv4 } from 'uuid';
import { selectors, useAppSelector } from '<src>/store';
import { useFetchEndpoints } from '<src>/hooks/useFetchEndpoints';
import {
  CapturePageWithoutDiffOrRedirect,
  CapturePageWithDiff,
} from './CapturePage';
import { PageLayout } from '<src>/components';
import { LoadingDiffReview } from '<src>/pages/diffs/components/LoadingDiffReview';
import { usePaths } from '<src>/hooks/usePathsHook';
import { IRequestBody } from '<src>/types';

export function DiffReviewPages(props: any) {
  const { match } = props;
  const { boundaryId } = match.params;
  const diffId = useMemo(() => uuidv4(), []);

  //dependencies
  const diff = useDiffsForCapture(boundaryId, diffId);
  useFetchEndpoints();
  const endpointsState = useAppSelector((state) => state.endpoints.results);
  const filteredEndpoints = useMemo(
    () => selectors.filterRemovedEndpoints(endpointsState.data || []),
    [endpointsState.data]
  );
  const allRequests = useMemo(
    () =>
      filteredEndpoints
        .map((endpoint) => endpoint.requestBody)
        .filter((body) => !!body) as IRequestBody[], // cast to IRequestBody as filter removes non-null
    [filteredEndpoints]
  );
  const allResponses = useMemo(
    () => filteredEndpoints.flatMap((endpoint) => endpoint.responseBodies),
    [filteredEndpoints]
  );
  const allPaths = usePaths();

  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffReviewCapturePageLink = useDiffReviewCapturePageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  const isLoading = diff.loading || endpointsState.loading || allPaths.loading;

  if (isLoading) {
    return (
      <PageLayout>
        <LoadingDiffReview />
      </PageLayout>
    );
  }

  return (
    <SharedDiffStore
      diffService={diff.data!.diffService}
      diffs={diff.data!.diffs}
      diffTrails={diff.data!.trails}
      urls={diff.data!.urls}
      captureId={boundaryId}
      endpoints={filteredEndpoints}
      allPaths={allPaths.paths}
      requests={allRequests}
      responses={allResponses}
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
