import { useRouterPaths } from '../../../RouterPaths';
import { Redirect, Route, Switch } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { AllCapturesContext, AllCapturesStore } from './AllCapturesContext';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import { CaptureContextStore } from '../../../contexts/CaptureContext';
import { useServices } from '../../../contexts/SpecServiceContext';
import { LoadingDiffPage, ReviewDiffSession } from './ReviewDiffSession';
import { ReviewUI } from './ReviewUI';
import { debugDump } from '../../../utilities/debug-dump';

export function ReviewDiffPage(props) {
  const routerPaths = useRouterPaths();
  return (
    <AllCapturesStore>
      <Switch>
        <Route
          path={routerPaths.reviewRootWithBoundary}
          component={ReviewDiffRoutes}
        />
        <Route strict path={routerPaths.reviewRoot} component={RootComponent} />
      </Switch>
    </AllCapturesStore>
  );
}

function RootComponent() {
  const { captures } = useContext(AllCapturesContext);
  const baseUrl = useBaseUrl();
  if (captures.length === 0) {
    return null;
  }
  return <Redirect to={`${baseUrl}/review/${captures[0].captureId}`} />;
}

export const ReviewDiffRoutes = (props) => {
  const { boundaryId } = props.match.params;
  const routerPaths = useRouterPaths();
  const { captures } = useContext(AllCapturesContext);
  const baseUrl = useBaseUrl();
  const services = useServices();

  const baseDiffReviewPath = props.location.pathname;

  useEffect(() => {
    global.debugOptic =
      boundaryId && debugDump(services.specService, boundaryId);
  }, [boundaryId]);

  if (captures.length === 0) {
    return <LoadingDiffPage />;
  }

  return (
    <CaptureContextStore
      captureId={boundaryId}
      ignoredDiffs={[]}
      key={boundaryId}
      {...services}
    >
      <ReviewDiffSession
        key={boundaryId + 'diff'}
        baseDiffReviewPath={baseDiffReviewPath}
      >
        <Switch>
          <Route
            strict
            path={routerPaths.reviewRootWithBoundary}
            component={(props) => {
              return <ReviewUI key={'review-ui' + boundaryId} />;
            }}
          />
        </Switch>
      </ReviewDiffSession>
    </CaptureContextStore>
  );
};
