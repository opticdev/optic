import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import WelcomePage from '<src>/pages/onboarding/WelcomePage';
import { OpticEngineStore } from '<src>/hooks/useOpticEngine';
import CloudViewer from './cloud-viewer';

export default function TopLevelRoutes() {
  return (
    <OpticEngineStore>
      <Switch>
        <Route
          strict
          //@TODO: centralize this path pattern
          path="/person/:personId/public-specs/:specId"
          component={CloudViewer}
        />

        <Route strict path={'/'} component={WelcomePage} />
      </Switch>
    </OpticEngineStore>
  );
}
