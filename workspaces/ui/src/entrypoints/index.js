import React from 'react';
import { Route, Switch } from 'react-router-dom';
import TestingSessions from './testing-sessions';
import LocalCli from './localcli';
import WelcomePage from '../components/support/WelcomePage';
import PrivateSessions from './private-sessions';

export default function TopLevelRoutes() {
  return (
    <Switch>
      <Route
        strict
        path="/development/private-sessions/:sessionId"
        component={PrivateSessions}
      />
      <Route
        strict
        path="/development/:sessionId"
        component={TestingSessions}
      />
      <Route strict path="/apis/:apiId" component={LocalCli} />
      <Route strict path={'/'} component={WelcomePage} />
    </Switch>
  );
}
