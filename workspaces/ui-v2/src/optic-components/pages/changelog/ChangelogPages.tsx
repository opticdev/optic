import * as React from 'react';
import { useMemo } from 'react';
import { NavigationRoute } from '../../navigation/NavigationRoute';
import {
  useChangelogPages,
  useDocumentationPageLink,
  useEndpointPageLink,
} from '../../navigation/Routes';
import groupBy from 'lodash.groupby';
import { CenteredColumn } from '../../layouts/CenteredColumn';
import { IEndpoint, useEndpoints } from '../../hooks/useEndpointsHook';
import { Box, List, Typography } from '@material-ui/core';
import { EndpointName, EndpointRow } from '../../documentation/EndpointName';
import { ContributionEditingStore } from '../../hooks/edit/Contributions';
import { EditContributionsButton } from '../../hooks/edit/EditContributionsButton';
import { FullWidth } from '../../layouts/FullWidth';
import { EndpointNameContribution } from '../../documentation/Contributions';
import { MarkdownBodyContribution } from '../../documentation/MarkdownBodyContribution';
import { TwoColumn } from '../../documentation/TwoColumn';
import { useHistory } from 'react-router-dom';
import { PathParametersViewEdit } from '../../documentation/PathParameters';
import { EndpointTOC } from '../../documentation/EndpointTOC';
import { useEndpointBody } from '../../hooks/useEndpointBodyHook';
import { CodeBlock } from '../../documentation/BodyRender';
import { SubtleBlueBackground } from '../../theme';
import { TwoColumnBody } from '../../documentation/RenderBody';
import { getEndpointId } from '../../utilities/endpoint-utilities';
import { Loading } from '../../navigation/Loading';
import { ChangesSinceDropdown } from '../../changelog/ChangelogDropdown';
import { DocumentationRootPage } from '../docs/DocumentationPage';

export function ChangelogPages(props: any) {
  const changelogPages = useChangelogPages();
  return (
    <ContributionEditingStore initialIsEditingState={false}>
      <>
        <NavigationRoute
          path={changelogPages.path}
          Component={DocumentationRootPage}
          AccessoryNavigation={ChangelogPageAccessoryNavigation}
        />
        {/*<NavigationRoute*/}
        {/*  path={endpointPageLink.path}*/}
        {/*  Component={EndpointRootPage}*/}
        {/*  AccessoryNavigation={DocsPageAccessoryNavigation}*/}
        {/*/>*/}
      </>
    </ContributionEditingStore>
  );
}

function ChangelogPageAccessoryNavigation(props: any) {
  return (
    <div style={{ paddingRight: 10, display: 'flex', flexDirection: 'row' }}>
      <ChangesSinceDropdown />
    </div>
  );
}
