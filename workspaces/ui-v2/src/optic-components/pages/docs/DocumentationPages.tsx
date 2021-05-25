import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { ContributionEditingStore } from '<src>/optic-components/hooks/edit/Contributions';
import {
  useDocumentationPageLink,
  useEndpointPageLink,
} from '<src>/optic-components/navigation/Routes';

import { DocumentationRootPageWithDocsNav } from './DocumentationRootPage';
import { EndpointRootPageWithDocsNav } from './EndpointRootPage';

export function DocumentationPages() {
  const documentationPageLink = useDocumentationPageLink();
  const endpointPageLink = useEndpointPageLink();

  return (
    <ContributionEditingStore>
      <Switch>
        <Route
          exact
          path={endpointPageLink.path}
          component={EndpointRootPageWithDocsNav}
        />
        <Route
          exact
          path={documentationPageLink.path}
          component={DocumentationRootPageWithDocsNav}
        />
        <Redirect to={documentationPageLink.path} />
      </Switch>
    </ContributionEditingStore>
  );
}
