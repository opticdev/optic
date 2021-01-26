import React, { Suspense } from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { useRouterPaths } from './RouterPaths';
import { DocsPage } from './components/docs/DocsPage';
import Loading from './components/navigation/Loading';
import { SetupPage } from './components/setup-page/SetupPage';
import { ReviewDiffPage } from './components/diff/review-diff/ReviewDiffPage';
import { FinalizeSummaryContextStore } from './components/diff/review-diff/FinalizeSummaryContext';

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
    <FinalizeSummaryContextStore>
      <Suspense fallback={<Loading />}>
        <Switch>
          {/*<Route strict path={routerPaths.dashboardRoot} component={ApiPage} />*/}
          <Route exact path={routerPaths.setup} component={SetupPage} />
          <Route path={routerPaths.docsRoot} component={DocsPage} />
          <Route
            strict
            path={routerPaths.reviewRoot}
            component={ReviewDiffPage}
          />
          <Redirect to={defaultRoute} />
        </Switch>
      </Suspense>
    </FinalizeSummaryContextStore>
  );
}
