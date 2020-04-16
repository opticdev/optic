import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { useRouterPaths } from './RouterPaths';
import TestingDashboardLoader from './components/loaders/TestingDashboardLoader';
import { CaptureManagerPage } from './components/diff/v2/CaptureManagerPage';
import { DocsPage } from './components/docs/DocsPage';

export function ApiRoutes(props) {
  const routerPaths = useRouterPaths();
  return (
    <Switch>
      <Route strict path={routerPaths.docsRoot} component={DocsPage} />
      <Route
        strict
        path={routerPaths.diffsRoot}
        component={CaptureManagerPage}
      />
      {process.env.REACT_APP_TESTING_DASHBOARD === 'true' && (
        <Route
          strict
          path={routerPaths.testingDashboard}
          component={TestingDashboardLoader}
        />
      )}
      <Redirect to={routerPaths.docsRoot} />
    </Switch>
  );
}
