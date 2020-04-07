import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Development from './development';
import LocalCli from './localcli';

export default function TopLevelRoutes() {
  return (
    <Switch>
      <Route strict path="/development/:sessionId" component={Development} />
      <Route strict path="/apis/:apiId" component={LocalCli} />
    </Switch>
  );
}
