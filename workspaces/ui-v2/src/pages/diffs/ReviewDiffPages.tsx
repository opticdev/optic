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
  pathsActions,
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
import { IOpticDiffService } from '../../../../spectacle/build';
import { useAnalytics } from '<src>/contexts/analytics';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';

export function DiffReviewPages(props: any) {
  const { match } = props;
  const { boundaryId } = match.params;
  const analytics = useAnalytics();
  const spectacle = useSpectacleContext();
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
        // unwrapResult throws an error if the thunk is rejected - we handle this in the redux layer
        // we just cannot continue if there is an error
        const results = unwrapResult(actionResult);
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

  useEffect(() => {
    dispatch(
      pathsActions.fetchPaths({
        spectacle,
      })
    );
  }, [dispatch, spectacle]);
  const pathsState = useAppSelector((state) => state.paths.results);

  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffReviewCapturePageLink = useDiffReviewCapturePageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  if (
    diffState.loading ||
    endpointsState.loading ||
    pathsState.loading ||
    !diffService
  ) {
    return (
      <PageLayout>
        <LoadingDiffReview />
      </PageLayout>
    );
  }
  if (diffState.error || endpointsState.error || pathsState.error) {
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
      allPaths={pathsState.data}
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
