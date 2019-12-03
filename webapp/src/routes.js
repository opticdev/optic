import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import Welcome from './components/onboarding/Welcome';
import ExampleCommandsLoader from './components/loaders/ExampleCommandsLoader.js';
import ExampleSessionsLoader from './components/loaders/ExampleSessionsLoader.js';
import LocalLoader from './components/routes/local';
import ExampleDrivenSpecLoader from './components/loaders/ExampleDrivenSpecLoader.js';
import Interceptor from './components/loaders/InterceptorLoader.js';
import {routerPaths} from './RouterPaths'


class AppRoutes extends React.Component {
  render() {
    // in local mode
    if (process.env.REACT_APP_CLI_MODE) {
      return (
        <div>
          <Switch>

            <Route strict path={routerPaths.interceptorRoot()} component={Interceptor} />
            <Redirect from={routerPaths.interceptorRoot()} to={routerPaths.interceptorRoot()} />
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
          <Route strict path={routerPaths.exampleDrivenRoot()} component={ExampleDrivenSpecLoader} />
          <Redirect from={routerPaths.exampleDrivenRoot()} to={routerPaths.exampleDrivenRoot()} />
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
