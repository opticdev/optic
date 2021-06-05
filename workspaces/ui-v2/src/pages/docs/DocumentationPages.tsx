import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import {
  useDocumentationPageLink,
  useEndpointPageLink,
} from '<src>/components/navigation/Routes';
import { useFetchEndpoints } from '<src>/hooks/useFetchEndpoints';

import { DocumentationRootPageWithDocsNav } from './DocumentationRootPage';
import { EndpointRootPageWithDocsNav } from './EndpointRootPage';

export function DocumentationPages() {
  const documentationPageLink = useDocumentationPageLink();
  const endpointPageLink = useEndpointPageLink();
  useFetchEndpoints();

  return (
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
  );
}
