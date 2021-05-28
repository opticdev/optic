import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import PublicExamples from './public-examples';
import WelcomePage from '<src>/pages/onboarding/WelcomePage';
import LocalCli from './local-cli';
import { OpticEngineStore } from '<src>/hooks/useOpticEngine';

export default function TopLevelRoutes() {
  return (
    <OpticEngineStore>
      <Switch>
        <Route
          strict
          //@TODO: centralize this path pattern
          path="/apis/:specId"
          component={LocalCli}
        />
        <Route
          strict
          //@TODO: centralize this path pattern
          path="/examples/:exampleId"
          render={(props: any) => (
            <PublicExamples {...props} lookupDir={'example-sessions'} />
          )}
        />
        <Route
          strict
          //@TODO: centralize this path pattern
          path="/private-sessions/:exampleId"
          render={(props: any) => (
            <PublicExamples {...props} lookupDir={'private-sessions'} />
          )}
        />

        <Route strict path={'/'} component={WelcomePage} />
      </Switch>
    </OpticEngineStore>
  );
}
