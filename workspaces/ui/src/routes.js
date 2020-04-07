import React from 'react';
import {Redirect, Switch, Route} from 'react-router-dom';
import Welcome from './components/onboarding/Welcome';
import ExampleSessionsLoader from './components/loaders/ExampleSessionsLoader.js';
import LocalLoader from './components/routes/local';
import {useRouterPaths} from './RouterPaths';
import SharedLoader from './components/loaders/SharedLoader';
import TestingDashboardLoader from './components/loaders/TestingDashboardLoader';
import {CaptureManagerPage} from './components/diff/v2/CaptureManagerPage';
import {DocsPage} from './components/docs/DocsPage';

export function ApiRoutes(props) {
  const routerPaths = useRouterPaths();

  return (
    <Switch>
      <Route
        strict
        path={routerPaths.documentationPage()}
        component={DocsPage}
      />
      <Route
        strict
        path={routerPaths.diffPage()}
        component={CaptureManagerPage}
      />
      {/*<Route*/}
      {/*  strict*/}
      {/*  path={routerPaths.testingDashboard()}*/}
      {/*  component={TestingDashboardLoader}*/}
      {/*/>*/}
      {/*<Route*/}
      {/*  strict*/}
      {/*  path={routerPaths.exampleSessionsRoot()}*/}
      {/*  component={ExampleSessionsLoader}*/}
      {/*/>*/}
      {/*<Route strict path={routerPaths.localRoot()} component={LocalLoader} />*/}
      {/*<Redirect to={routerPaths.localRoot()} />*/}
    </Switch>
  );
}
