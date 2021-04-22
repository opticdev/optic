import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import CloudViewer from '../../spectacle-implementations/cloud-viewer';
import WelcomePage from '../../optic-components/onboarding/WelcomePage';

export default function TopLevelRoutes() {
  return (
    <Switch>

      <Route
        strict
        //@TODO: centralize this path pattern
        path="/public-specs/:specId"
        component={CloudViewer}
      />

      <Route strict path={'/'} component={WelcomePage} />
    </Switch>
  );
}
