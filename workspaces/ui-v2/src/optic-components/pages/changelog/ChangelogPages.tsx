import * as React from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { NavigationRoute } from '../../navigation/NavigationRoute';
import {
  useChangelogEndpointPageLink,
  useChangelogPages,
  useDocumentationPageLink,
} from '../../navigation/Routes';
import { ContributionEditingStore } from '../../hooks/edit/Contributions';
import { ChangesSinceDropdown } from '../../changelog/ChangelogDropdown';
import {
  DocumentationRootPage,
  EndpointRootPage,
} from '../docs/DocumentationPage';
import { useBatchCommits } from '../../hooks/useBatchCommits';

export function ChangelogPages(props: any) {
  const changelogPages = useChangelogPages();
  const changelogPagesEndpointLink = useChangelogEndpointPageLink();
  const documentationPageLink = useDocumentationPageLink();
  const allBatchCommits = useBatchCommits();
  const history = useHistory();
  return (
    // @nic TODO fork changelog from documentation page and remove contribution editing store
    <ContributionEditingStore initialIsEditingState={false}>
      <>
        <NavigationRoute
          path={changelogPages.path}
          Component={(props: any) => {
            const { match } = props;
            const { params } = match;
            const { batchId } = params;
            const validBatchId = allBatchCommits.batchCommits.some(
              (i) => i.batchId === batchId
            );
            if (validBatchId && !allBatchCommits.loading) {
              return (
                <DocumentationRootPage
                  onEndpointClicked={(pathId, method) => {
                    history.push(
                      changelogPagesEndpointLink.linkTo(batchId, pathId, method)
                    );
                  }}
                  changelogBatchId={batchId}
                />
              );
            } else if (!allBatchCommits.loading) {
              return <Redirect to={documentationPageLink.linkTo()} />;
            } else {
              return null;
            }
          }}
          AccessoryNavigation={ChangelogPageAccessoryNavigation}
        />
        <NavigationRoute
          path={changelogPagesEndpointLink.path}
          Component={(props: any) => {
            const { match } = props;
            const { params } = match;
            const { batchId } = params;
            const validBatchId = allBatchCommits.batchCommits.some(
              (i) => i.batchId === batchId
            );

            if (validBatchId && !allBatchCommits.loading) {
              return (
                <EndpointRootPage
                  {...props}
                  isChangelogPage={true}
                  changelogBatchId={batchId}
                />
              );
            } else {
              return null;
            }
          }}
          AccessoryNavigation={ChangelogPageAccessoryNavigation}
        />
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
