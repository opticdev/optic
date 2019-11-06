import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import Welcome from './components/onboarding/Welcome';
import ExampleCommandsLoader from './components/loaders/ExampleCommandsLoader.js';
import ExampleSessionsLoader, { basePath as exampleSessionsBasePath } from './components/loaders/ExampleSessionsLoader.js';
import { LocalLoader } from './components/routes/local';

export const routerPaths = {
  exampleCommandsRoot: () => '/examples/:exampleId',
  exampleSessionsRoot: () => exampleSessionsBasePath,
  localRoot: () => '/saved',
  request: (base) => `${base}/requests/:requestId`,
  diff: (base) => `${base}/diff/:sessionId`,
  diffUrls: (base) => `${base}/urls`,
  diffRequest: (base) => `${base}/requests/:requestId`,
};

export const routerUrls = {
};

class AppRoutes extends React.Component {
  render() {
    // in local mode
    if (process.env.REACT_APP_CLI_MODE) {
      debugger
      return (
        <div>
          <Switch>
            <Route path={routerPaths.localRoot()} component={LocalLoader} />
            <Redirect to={routerPaths.localRoot()} />
          </Switch>
        </div>
      );
    }

    // running on website
    return (
      <div>
        <Switch>
          <Route strict path={routerPaths.exampleCommandsRoot()} component={ExampleCommandsLoader} />
          <Redirect from={routerPaths.exampleCommandsRoot()} to={routerPaths.exampleCommandsRoot()} />
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
