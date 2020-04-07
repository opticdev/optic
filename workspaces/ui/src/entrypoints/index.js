import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Development from './development';

export default function TopLevelRoutes() {
  return (
    <Switch>
      <Route strict path="/development/:sessionId" component={Development} />
      <Route
        strict
        path="/apis/:apiId"
        component={() => {
          return <div>APIs</div>;
        }}
      />
    </Switch>
  );
}
