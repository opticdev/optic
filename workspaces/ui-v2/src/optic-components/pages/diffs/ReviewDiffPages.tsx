import * as React from 'react';
import { NavigationRoute } from '../../navigation/NavigationRoute';
import {
  useDiffEnvironmentsRoot,
  useDiffForEndpointLink,
  useDiffReviewPageLink,
  useDiffReviewPagePendingEndpoint,
  useDiffUndocumentedUrlsPageLink,
} from '../../navigation/Routes';
import { ContributionEditingStore } from '../../hooks/edit/Contributions';
import { SharedDiffStore } from '../../hooks/diffs/SharedDiffContext';
import { PendingEndpointPageSession } from './PendingEndpointPage';
import { DiffUrlsPage } from './AddEndpointsPage';
import { Switch, Route, Redirect } from 'react-router-dom';

export function DiffReviewPages(props: any) {
  const { match } = props;
  // const { environment, boundaryId } = match.params;

  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();
  return (
    <SharedDiffStore>
      <ContributionEditingStore>
        <NavigationRoute
          path={diffUndocumentedUrlsPageLink.path}
          Component={DiffUrlsPage}
          AccessoryNavigation={() => <div></div>}
        />
        <NavigationRoute
          path={diffForEndpointLink.path}
          Component={() => <div>HELLO WORLD</div>}
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

export function DiffReviewEnvironments(props: any) {
  const diffEnvironmentsRoot = useDiffEnvironmentsRoot();
  return (
    <>
      <Route path={diffEnvironmentsRoot.path} component={DiffReviewPages} />
    </>
  );
}
