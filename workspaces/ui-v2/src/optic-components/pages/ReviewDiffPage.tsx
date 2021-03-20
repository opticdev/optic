import * as React from 'react';
import { useMemo } from 'react';
import { NavigationRoute } from '../navigation/NavigationRoute';
import {
  useDiffReviewPageLink,
  useDiffReviewPagePendingEndpoint,
} from '../navigation/Routes';
import { Redirect, useHistory } from 'react-router-dom';

import { TwoColumnFullWidth } from '../layouts/TwoColumnFullWidth';
import { DocumentationRootPage } from './DocumentationPage';
import { ContributionEditingStore } from '../hooks/edit/Contributions';
import { DiffHeader } from '../diffs/DiffHeader';
import { List } from '@material-ui/core';
import { useUndocumentedUrls } from '../hooks/diffs/useUndocumentedUrls';
import { UndocumentedUrl } from '../diffs/UndocumentedUrl';
import {
  SharedDiffStore,
  useSharedDiffContext,
} from '../hooks/diffs/SharedDiffContext';
import { AuthorIgnoreRules } from '../diffs/AuthorIgnoreRule';
import { ILearnedPendingEndpointStore } from '../hooks/diffs/LearnedPendingEndpointContext';
import { PendingEndpointPage } from './PendingEndpointPage';

export function DiffReviewPages(props: any) {
  const diffReviewPageLink = useDiffReviewPageLink();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  return (
    <SharedDiffStore>
      <ContributionEditingStore>
        <NavigationRoute
          path={diffReviewPageLink.path}
          Component={DiffUrlsPage}
          AccessoryNavigation={() => <div></div>}
        />
        <NavigationRoute
          path={diffReviewPagePendingEndpoint.path}
          Component={PendingEndpointPageSession}
          AccessoryNavigation={() => <div></div>}
        />
      </ContributionEditingStore>
    </SharedDiffStore>
  );
}

export function DiffUrlsPage(props: any) {
  const urls = useUndocumentedUrls();
  const name = `${urls.filter((i) => !i.hide).length} unmatched URL observed`;
  const history = useHistory();
  const { documentEndpoint } = useSharedDiffContext();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader name={name} />
          <List style={{ paddingTop: 0, overflow: 'scroll' }}>
            {urls.map((i, index) => (
              <UndocumentedUrl
                {...i}
                key={index}
                onFinish={(pattern, method) => {
                  const pendingId = documentEndpoint(pattern, method);
                  const link = diffReviewPagePendingEndpoint.linkTo(pendingId);
                  setTimeout(() => history.push(link), 500);
                }}
              />
            ))}
          </List>
          <div style={{ flex: 1 }} />
          <AuthorIgnoreRules />
        </>
      }
      right={<DocumentationRootPage />}
    />
  );
}

export function PendingEndpointPageSession(props: any) {
  const { match } = props;
  const { endpointId } = match.params;

  const history = useHistory();
  const diffReviewPageLink = useDiffReviewPageLink();

  const goToDiffPage = () => history.push(diffReviewPageLink.linkTo());

  const {
    getPendingEndpointById,
    stageEndpoint,
    discardEndpoint,
  } = useSharedDiffContext();

  // should only run once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const endpoint = useMemo(() => getPendingEndpointById(endpointId), [
    endpointId,
  ]);

  if (!endpoint) {
    return <Redirect to={diffReviewPageLink.linkTo()} />;
  }

  return (
    <ILearnedPendingEndpointStore
      endpoint={endpoint}
      onEndpointStaged={() => {
        stageEndpoint(endpoint.id);
        goToDiffPage();
      }}
      onEndpointDiscarded={() => {
        discardEndpoint(endpoint.id);
        goToDiffPage();
      }}
    >
      <PendingEndpointPage />
    </ILearnedPendingEndpointStore>
  );
}
