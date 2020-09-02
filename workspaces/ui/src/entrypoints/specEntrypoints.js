import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import SpecViewer from './spec-viewer';
import SpecHomePage from '../components/support/SpecHomePage';

export default function SpecTopLevelRoutes() {
  return (
    <Switch>
        <Route
            strict
            path="/public/:specId"
            component={SpecViewer}
        />
      <Route strict path={'/'} component={SpecHomePage} />
    </Switch>
  );
}
