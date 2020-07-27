import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import DemoSessions from './demo-sessions';

export default function DemoTopLevelRoutes() {
  return (
    <Switch>
      <Route
        strict
        path="/demos/:sessionId"
        component={DemoSessions}
      />
        
        <Redirect strict path={'/'} to={process.env.PUBLIC_URL + '/demos/todo'} />
    </Switch>
  );
}
