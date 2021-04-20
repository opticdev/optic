import * as React from 'react';
import { Redirect } from 'react-router-dom';
import { NavigationRoute } from '../../navigation/NavigationRoute';
import {
  useChangelogPages,
  useDocumentationPageLink,
} from '../../navigation/Routes';
import { ContributionEditingStore } from '../../hooks/edit/Contributions';
import { ChangesSinceDropdown } from '../../changelog/ChangelogDropdown';
import { DocumentationRootPage } from '../docs/DocumentationPage';
import { useBatchCommits } from '../../hooks/useBatchCommits';

export function ChangelogPages(props: any) {
  const changelogPages = useChangelogPages();
  const documentationPageLink = useDocumentationPageLink();
  const allBatchCommits = useBatchCommits();

  return (
    <ContributionEditingStore initialIsEditingState={false}>
      <>
        <NavigationRoute
          path={changelogPages.path}
          Component={(props: any) => {
            const { match } = props;
            const { params } = match;
            const { batchId } = params;
            const validBatchId = allBatchCommits.some(
              (i) => i.batchId === batchId,
            );

            if (validBatchId) {
              return <DocumentationRootPage changelogBatchId={batchId} />;
            } else {
              return <Redirect to={documentationPageLink.linkTo()} />;
            }
          }}
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
