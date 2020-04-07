import React from 'react'
import {Route, Switch} from 'react-router-dom';
import Development from './development';
import LocalCLI from './localcli';

export default function TopLevelRoutes() {
  return (
    <div>
      <Switch>
        <Route
          strict
          path="/development/:sessionId"
          component={Development}
        />
        <Route
          strict
          path="/apis/:apiId"
          component={LocalCLI}
        />
      </Switch>
    </div>
  );
}
