import React, { Suspense } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { useRouterPaths } from './RouterPaths';
import { CaptureManagerPage } from './components/diff/v2/CaptureManagerPage';
import { DocsPage } from './components/docs/DocsPage';
import Loading from './components/navigation/Loading';
import { ReviewDiffPage } from './components/diff/review-diff/ReviewDiffPage';

const TestingDashboardLoader = React.lazy(() =>
  import('./components/loaders/TestingDashboardLoader')
);

const TestindDashboardTeaserPage = React.lazy(() =>
  import('./components/testing/TeaserPage')
);

export function ApiRoutes(props) {
  const routerPaths = useRouterPaths();
  const defaultRoute = props.getDefaultRoute
    ? props.getDefaultRoute(routerPaths)
    : routerPaths.docsRoot;

  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route strict path={routerPaths.docsRoot} component={DocsPage} />
        <Route
          strict
          path={routerPaths.diffsRoot}
          component={CaptureManagerPage}
        />
        <Route
          strict
          path={routerPaths.diffsRoot}
          component={CaptureManagerPage}
        />
        <Route strict path={routerPaths.review} component={ReviewDiffPage} />
        {process.env.REACT_APP_TESTING_DASHBOARD === 'true' && (
          <Route
            strict
            path={routerPaths.testingDashboard}
            component={TestingDashboardLoader}
          />
        )}

        {process.env.REACT_APP_TESTING_DASHBOARD !== 'true' &&
          process.env.REACT_APP_TESTING_DASHBOARD_TEASER === 'true' && (
            <Route
              strict
              path={routerPaths.testingDashboard}
              component={TestindDashboardTeaserPage}
            />
          )}

        <Redirect to={defaultRoute} />
      </Switch>
    </Suspense>
  );
}
