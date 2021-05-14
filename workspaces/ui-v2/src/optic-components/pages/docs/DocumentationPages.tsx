import React from 'react';
import { useHistory } from 'react-router-dom';
import { NavigationRoute } from '<src>/optic-components/navigation/NavigationRoute';
import {
  useDocumentationPageLink,
  useEndpointPageLink,
} from '<src>/optic-components/navigation/Routes';
import { ContributionEditingStore } from '<src>/optic-components/hooks/edit/Contributions';
import { useBaseUrl } from '<src>/optic-components/hooks/useBaseUrl';

import { DocsPageAccessoryNavigation } from './components';
import { DocumentationRootPage } from './DocumentationRootPage';
import { EndpointRootPage } from './EndpointRootPage';

export function DocumentationPages() {
  const documentationPageLink = useDocumentationPageLink();
  const endpointPageLink = useEndpointPageLink();
  const history = useHistory();
  const baseUrl = useBaseUrl();

  const onEndpointClicked = (pathId: string, method: string) => {
    history.push(endpointPageLink.linkTo(pathId, method));
  };

  return (
    <ContributionEditingStore>
      <>
        <NavigationRoute
          path={baseUrl}
          Component={(props: any) => (
            <DocumentationRootPage
              {...props}
              onEndpointClicked={onEndpointClicked}
            />
          )}
          AccessoryNavigation={DocsPageAccessoryNavigation}
        />
        <NavigationRoute
          path={documentationPageLink.path}
          Component={(props: any) => (
            <DocumentationRootPage
              {...props}
              onEndpointClicked={onEndpointClicked}
            />
          )}
          AccessoryNavigation={DocsPageAccessoryNavigation}
        />
        <NavigationRoute
          path={endpointPageLink.path}
          Component={EndpointRootPage}
          AccessoryNavigation={DocsPageAccessoryNavigation}
        />
      </>
    </ContributionEditingStore>
  );
}
