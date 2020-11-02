import { useRouterPaths } from '../../../RouterPaths';
import Page from '../../Page';
import { Redirect, Route, Switch } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { AllCapturesContext, AllCapturesStore } from '../v2/CaptureManagerPage';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import { CaptureContextStore } from '../../../contexts/CaptureContext';
import { useServices } from '../../../contexts/SpecServiceContext';
import { ReviewDiffSession } from './ReviewDiffSession';
import { captureId } from '../../loaders/ApiLoader';
import { ReviewUI } from './ReviewUI';

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
    return <LinearProgress />;
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

  if (captures.length === 0) {
    return <LinearProgress />;
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
