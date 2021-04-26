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
    <ContributionEditingStore initialIsEditingState={false}>
      <>
        <NavigationRoute
          path={changelogPages.path}
          Component={(props: any) => {
            const { match } = props;
            const { params } = match;
            const { batchId } = params;
            const validBatchId = allBatchCommits.some(
              (i) => i.batchId === batchId
            );

            if (validBatchId) {
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
            } else {
              return <Redirect to={documentationPageLink.linkTo()} />;
            }
          }}
          AccessoryNavigation={ChangelogPageAccessoryNavigation}
        />
        <NavigationRoute
          path={changelogPagesEndpointLink.path}
          Component={EndpointRootPage}
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
