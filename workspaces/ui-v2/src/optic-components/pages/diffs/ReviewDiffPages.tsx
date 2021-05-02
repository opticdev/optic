import * as React from 'react';
import { useState } from 'react';
import { NavigationRoute } from '../../navigation/NavigationRoute';
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
import { Redirect, Route, Switch } from 'react-router-dom';
import { ReviewEndpointDiffContainer } from './ReviewEndpointDiffPage';
import { DiffAccessoryNavigation } from '../../diffs/DiffAccessoryNavigation';
import { useDiffsForCapture } from '../../hooks/useDiffForCapture';
import { v4 as uuidv4 } from 'uuid';
import { useAllRequestsAndResponses } from '../../hooks/diffs/useAllRequestsAndResponses';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import { CapturePage } from './CapturePage';
import { LoadingPage } from '../../loaders/Loading';
import { LoadingDiffReview } from '../../diffs/LoadingDiffReview';

export function DiffReviewPages(props: any) {
  const { match } = props;
  const { boundaryId } = match.params;
  const [diffId] = useState(uuidv4());

  //dependencies
  const diff = useDiffsForCapture(boundaryId, diffId);
  const allRequestsAndResponsesOfBaseSpec = useAllRequestsAndResponses();
  const allEndpointsOfBaseSpec = useEndpoints();

  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffReviewCapturePageLink = useDiffReviewCapturePageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  const isLoading =
    diff.loading ||
    allEndpointsOfBaseSpec.loading ||
    allRequestsAndResponsesOfBaseSpec.loading;

  if (isLoading) {
    return (
      <LoadingPage>
        <LoadingDiffReview cursor={19} total={100} />
      </LoadingPage>
    );
  }

  return (
    <SharedDiffStore
      diffService={diff.data!.diffService}
      diffs={diff.data!.diffs}
      diffTrails={diff.data!.trails}
      urls={diff.data!.urls}
      endpoints={allEndpointsOfBaseSpec.endpoints}
      requests={allRequestsAndResponsesOfBaseSpec.data?.requests!}
      responses={allRequestsAndResponsesOfBaseSpec.data?.responses!}
    >
      <NavigationRoute
        path={diffReviewCapturePageLink.path}
        Component={() => <CapturePage showDiff={true} />}
        AccessoryNavigation={() => <DiffAccessoryNavigation />}
      />
      <NavigationRoute
        path={diffUndocumentedUrlsPageLink.path}
        Component={DiffUrlsPage}
        AccessoryNavigation={() => <DiffAccessoryNavigation />}
      />
      <NavigationRoute
        path={diffForEndpointLink.path}
        Component={ReviewEndpointDiffContainer}
        AccessoryNavigation={() => <DiffAccessoryNavigation />}
      />
      <NavigationRoute
        path={diffReviewPagePendingEndpoint.path}
        Component={PendingEndpointPageSession}
        AccessoryNavigation={() => <DiffAccessoryNavigation />}
      />
      <Redirect to={diffReviewCapturePageLink.linkTo()} />
    </SharedDiffStore>
  );
}

export function DiffReviewEnvironments(props: any) {
  const diffRoot = useDiffReviewPageLink();
  const diffEnvironmentsRoot = useDiffEnvironmentsRoot();

  return (
    <Switch>
      <>
        <NavigationRoute
          path={diffRoot.path}
          Component={CapturePage}
          AccessoryNavigation={() => null}
        />
        <Route path={diffEnvironmentsRoot.path} component={DiffReviewPages} />
        {/*<Redirect*/}
        {/*  to={diffEnvironmentsRoot.linkTo(*/}
        {/*    'local',*/}
        {/*    capturesState.captures[0].captureId*/}
        {/*  )}*/}
        {/*/>*/}
      </>
    </Switch>
  );
}
