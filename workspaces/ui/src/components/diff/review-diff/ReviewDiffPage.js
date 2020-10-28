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

export function ReviewDiffPage(props) {
  const routerPaths = useRouterPaths();
  return (
    <Page title="Review API Diffs">
      <AllCapturesStore>
        <Switch>
          <Route path={routerPaths.reviewRoot} component={ReviewDiffRoutes} />
        </Switch>
      </AllCapturesStore>
    </Page>
  );
}

export const ReviewDiffRoutes = ({ location }) => {
  const routerPaths = useRouterPaths();
  const { captures } = useContext(AllCapturesContext);
  const baseUrl = useBaseUrl();
  const services = useServices();

  if (captures.length === 0) {
    return <LinearProgress />;
  }
  return (
    <Switch>
      <Route
        path={routerPaths.reviewRootWithBoundary}
        component={(props) => {
          const { boundaryId } = props.match.params;
          return (
            <CaptureContextStore
              captureId={boundaryId}
              ignoredDiffs={[]}
              key={boundaryId}
              {...services}
            >
              <ReviewDiffSession key={boundaryId + 'diff'} />
            </CaptureContextStore>
          );
        }}
      />
      {captures.length && (
        <Redirect to={`${baseUrl}/review/${captures[0].captureId}`} />
      )}
    </Switch>
  );
};
