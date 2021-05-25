import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import { ContributionEditingStore } from '<src>/optic-components/hooks/edit/Contributions';
import {
  useChangelogPages,
  useChangelogEndpointPageLink,
} from '<src>/optic-components/navigation/Routes';

import { ChangelogListPage } from './ChangelogListPage';
import { ChangelogEndpointRootPage } from './ChangelogEndpointRootPage';

export function ChangelogPages() {
  const changelogPages = useChangelogPages();
  const changelogEndpointPageLink = useChangelogEndpointPageLink();

  return (
    // @nic TODO fork changelog from documentation page and remove contribution editing store
    <ContributionEditingStore initialIsEditingState={false}>
      <Switch>
        <Route
          exact
          path={changelogEndpointPageLink.path}
          component={ChangelogEndpointRootPage}
        />
        <Route exact path={changelogPages.path} component={ChangelogListPage} />
        <Redirect to={changelogPages.path} />
      </Switch>
    </ContributionEditingStore>
  );
}
