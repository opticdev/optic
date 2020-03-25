import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import Welcome from './components/onboarding/Welcome';
import ExampleSessionsLoader from './components/loaders/ExampleSessionsLoader.js';
import LocalLoader from './components/routes/local';
import { routerPaths } from './RouterPaths'
import SharedLoader from './components/loaders/SharedLoader';
import {ExampleTestingDashboardLoader} from './components/dashboards/TestingDashboard';


class AppRoutes extends React.Component {
  render() {
    // in local mode
    if (process.env.REACT_APP_CLI_MODE) {
      return (
        <div>
          <Switch>
            <Route strict path={routerPaths.exampleTestingDashboard()} component={ExampleTestingDashboardLoader()} />
            <Route strict path={routerPaths.exampleTestingDashboard()} to={routerPaths.exampleTestingDashboard()} />
            <Route strict path={routerPaths.exampleSessionsRoot()} component={ExampleSessionsLoader} />
            <Redirect from={routerPaths.exampleSessionsRoot()} to={routerPaths.exampleSessionsRoot()} />
            <Route strict path={routerPaths.localRoot()} component={LocalLoader} />
            <Redirect to={routerPaths.localRoot()} />
          </Switch>
        </div>
      );
    }

    // running on website
    return (
      <div>
        <Switch>
          <Route strict path={routerPaths.sharedRoot()} component={SharedLoader} />
          <Redirect from={routerPaths.sharedRoot()} to={routerPaths.sharedRoot()} />
          <Route strict path={routerPaths.exampleSessionsRoot()} component={ExampleSessionsLoader} />
          <Redirect from={routerPaths.exampleSessionsRoot()} to={routerPaths.exampleSessionsRoot()} />
          <Route exact path={'/'} component={Welcome} />
          <Redirect to={'/'} />
        </Switch>
      </div>
    );

  }
}

export default AppRoutes;
