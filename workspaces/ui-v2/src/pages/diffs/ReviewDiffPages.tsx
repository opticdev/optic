import React, { useEffect, useMemo, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';

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
import {
  diffActions,
  selectors,
  useAppDispatch,
  useAppSelector,
} from '<src>/store';
import { useFetchEndpoints } from '<src>/hooks/useFetchEndpoints';
import {
  CapturePageWithoutDiffOrRedirect,
  CapturePageWithDiff,
} from './CapturePage';
import { PageLayout } from '<src>/components';
import { LoadingDiffReview } from '<src>/pages/diffs/components/LoadingDiffReview';
import { useCapturesService } from '<src>/hooks/useCapturesHook';
import { usePaths } from '<src>/hooks/usePathsHook';
import { IRequestBody } from '<src>/types';
import { IOpticDiffService } from '../../../../spectacle/build';
import { useAnalytics } from '<src>/contexts/analytics';

export function DiffReviewPages(props: any) {
  const { match } = props;
  const { boundaryId } = match.params;
  const analytics = useAnalytics();
  const capturesService = useCapturesService();
  const [diffService, setDiffService] = useState<IOpticDiffService | null>(
    null
  );

  const dispatch = useAppDispatch();

  useFetchEndpoints();
  const endpointsState = useAppSelector((state) => state.endpoints.results);
  useEffect(() => {
    (async () => {
      const startTime = Date.now();
      const actionResult = await dispatch(
        diffActions.fetchDiffsForCapture({
          capturesService,
          captureId: boundaryId,
        })
      );

      try {
        const results = await unwrapResult(actionResult);
        const endTime = Date.now();
        setDiffService(results.diffService);
        analytics.reviewPageLoaded(
          results.data.diffs.length,
          results.data.urls.length,
          endTime - startTime,
          results.numberOfEndpoints
        );
      } catch (e) {}
    })();
  }, [dispatch, capturesService, boundaryId, analytics]);
  const diffState = useAppSelector((state) => state.diff.state);
  const filteredEndpoints = useMemo(
    () =>
      selectors.filterRemovedEndpoints(endpointsState.data?.endpoints || []),
    [endpointsState.data]
  );
  const allRequests = useMemo(
    () =>
      filteredEndpoints
        .flatMap((endpoint) => endpoint.requestBodies)
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

  if (
    diffState.loading ||
    endpointsState.loading ||
    allPaths.loading ||
    !diffService
  ) {
    return (
      <PageLayout>
        <LoadingDiffReview />
      </PageLayout>
    );
  }
  if (diffState.error || endpointsState.error) {
    return <>error loading diff page</>;
  }

  return (
    <SharedDiffStore
      diffService={diffService}
      diffs={diffState.data.diffs}
      diffTrails={diffState.data.trails}
      urls={diffState.data.urls}
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
