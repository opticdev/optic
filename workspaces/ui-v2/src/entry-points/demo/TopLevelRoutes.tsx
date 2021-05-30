import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import DemoExamples from './demo-examples';
import WelcomePage from '<src>/pages/onboarding/WelcomePage';
import { OpticEngineStore } from '<src>/hooks/useOpticEngine';

export default function TopLevelRoutes() {
  return (
    <OpticEngineStore>
      <Switch>
        <Route
          strict
          //@TODO: centralize this path pattern
          path="/examples/:exampleId"
          render={(props: any) => (
            <DemoExamples {...props} lookupDir={'example-sessions'} />
          )}
        />

        <Route strict path={'/'} component={WelcomePage} />
      </Switch>
    </OpticEngineStore>
  );
}
