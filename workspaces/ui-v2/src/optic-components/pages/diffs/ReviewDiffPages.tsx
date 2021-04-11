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
import { SharedDiffStoreWithDependencies } from '../../hooks/diffs/SharedDiffContext';
import { PendingEndpointPageSession } from './PendingEndpointPage';
import { DiffUrlsPage } from './AddEndpointsPage';
import { Route } from 'react-router-dom';
import { ReviewEndpointDiffPage } from './ReviewEndpointDiffPage';
import { DiffAccessoryNavigation } from '../../diffs/DiffAccessoryNavigation';
import { DiffEnvsPage } from './DiffEnvsPage';

export function DiffReviewPages(props: any) {
  // const { match } = props;
  // const { environment, boundaryId } = match.params;

  //@dev: useCapture(boundaryId)
  //@dev: useDiff(diffId, boundaryId)
  // returns loading until diff is done
  // DiffContext.Provider value={{...}}

  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  return (
    <SharedDiffStoreWithDependencies>
      <ContributionEditingStore initialIsEditingState={true}>
        <NavigationRoute
          path={diffUndocumentedUrlsPageLink.path}
          Component={DiffUrlsPage}
          AccessoryNavigation={() => (
            <DiffAccessoryNavigation onUrlsPage={true} />
          )}
        />
        <NavigationRoute
          path={diffForEndpointLink.path}
          Component={ReviewEndpointDiffPage}
          AccessoryNavigation={() => <DiffAccessoryNavigation />}
        />
        <NavigationRoute
          path={diffReviewPagePendingEndpoint.path}
          Component={PendingEndpointPageSession}
          AccessoryNavigation={() => (
            <DiffAccessoryNavigation onUrlsPage={true} />
          )}
        />
      </ContributionEditingStore>
    </SharedDiffStoreWithDependencies>
  );
}

export function DiffReviewEnvironments(props: any) {
  const diffRoot = useDiffReviewPageLink();
  const diffEnvironmentsRoot = useDiffEnvironmentsRoot();
  return (
    <>
      <NavigationRoute
        path={diffRoot.path}
        Component={DiffEnvsPage}
        AccessoryNavigation={null}
      />
      <Route path={diffEnvironmentsRoot.path} component={DiffReviewPages} />
    </>
  );
}
