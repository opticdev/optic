import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import CloudViewer from '../../spectacle-implementations/cloud-viewer';
import WelcomePage from '../../optic-components/onboarding/WelcomePage';
import { OpticEngineStore } from '../../optic-components/hooks/useOpticEngine';

export default function TopLevelRoutes() {
  return (
    <OpticEngineStore>
      <Switch>
        <Route
          strict
          //@TODO: centralize this path pattern
          path="/public-specs/:specId"
          component={CloudViewer}
        />

        <Route strict path={'/'} component={WelcomePage} />
      </Switch>
    </OpticEngineStore>
  );
}
