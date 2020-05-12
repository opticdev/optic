import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Development from './development';
import LocalCli from './localcli';
import WelcomePage from '../components/support/WelcomePage';

export default function TopLevelRoutes() {
  return (
    <Switch>
      <Route
        strict
        path="/development/private-sessions/:sessionId"
        component={Development}
      />
      <Route strict path="/development/:sessionId" component={Development} />
      <Route strict path="/apis/:apiId" component={LocalCli} />
      <Route strict path={'/'} component={WelcomePage} />
    </Switch>
  );
}
