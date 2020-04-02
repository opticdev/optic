import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import Welcome from './components/onboarding/Welcome';
import ExampleSessionsLoader from './components/loaders/ExampleSessionsLoader.js';
import LocalLoader from './components/routes/local';
import { useRouterPaths } from './RouterPaths';
import SharedLoader from './components/loaders/SharedLoader';
import {
  useDebugSession,
  Provider as DebugSessionContextProvider
} from './contexts/DebugSessionContext';
import TestingDashboardLoader from './components/loaders/TestingDashboardLoader';

function AppRoutes(props) {
  const routerPaths = useRouterPaths();

  return (
    <Switch>
      <Route
        strict
        path={routerPaths.testingDashboard()}
        component={TestingDashboardLoader}
      />
      <Route
        strict
        path={routerPaths.exampleTestingDashboard()}
        to={routerPaths.exampleTestingDashboard()}
      />
      <Route
        strict
        path={routerPaths.exampleSessionsRoot()}
        component={ExampleSessionsLoader}
      />
      <Redirect
        from={routerPaths.exampleSessionsRoot()}
        to={routerPaths.exampleSessionsRoot()}
      />
      <Route strict path={routerPaths.localRoot()} component={LocalLoader} />
      <Redirect to={routerPaths.localRoot()} />
    </Switch>
  );
}

function DebuggedRoutes(props) {
  const { match } = props;
  const debugSession = useDebugSession({
    sessionId: match.params.sessionId,
    path: match.url
  });

  return (
    <DebugSessionContextProvider value={debugSession}>
      <AppRoutes />;
    </DebugSessionContextProvider>
  );
}

export default function Routes() {
  return (
    <div>
      <Switch>
        <Route
          strict
          path="/debug-sessions/:sessionId"
          component={DebuggedRoutes}
        />
        <Route component={AppRoutes} />
      </Switch>
    </div>
  );
}

// class AppRoutes extends React.Component {
//   render() {
//     // in local mode
//     if (process.env.REACT_APP_CLI_MODE) {
//       return (
//         <div>
//         </div>
//       );
//     }

//     // running on website
//     return (
//       <div>
//         <Switch>
//           <Route strict path={routerPaths.sharedRoot()} component={SharedLoader} />
//           <Redirect from={routerPaths.sharedRoot()} to={routerPaths.sharedRoot()} />
//           <Route strict path={routerPaths.exampleSessionsRoot()} component={ExampleSessionsLoader} />
//           <Redirect from={routerPaths.exampleSessionsRoot()} to={routerPaths.exampleSessionsRoot()} />
//           <Route exact path={'/'} component={Welcome} />
//           <Redirect to={'/'} />
//         </Switch>
//       </div>
//     );

//   }
// }

// export default AppRoutes;
