import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import PublicExamples from '../../spectacle-implementations/public-examples';
import WelcomePage from '../../optic-components/onboarding/WelcomePage';
import LocalCli from '../../spectacle-implementations/local-cli';

export default function TopLevelRoutes() {
  return (
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
        component={PublicExamples}
      />

      <Route strict path={'/'} component={WelcomePage} />
    </Switch>
  );
}
