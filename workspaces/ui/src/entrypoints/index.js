import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import TestingSessions from './testing-sessions';
import LocalCli from './localcli';
import WelcomePage from '../components/support/WelcomePage';
import PrivateSessions from './private-sessions';
import DemoSessions from './demo-sessions';
import SpecViewer from './spec-viewer';

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
      <Route
        strict
        path="/demos/:sessionId"
        component={DemoSessions}
      />
      <Route strict path="/apis/:apiId" component={LocalCli} />

      <Route strict path={'/'} component={WelcomePage} />
    </Switch>
  );
}
