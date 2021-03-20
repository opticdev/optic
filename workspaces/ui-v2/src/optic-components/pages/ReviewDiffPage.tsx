import * as React from 'react';
import { NavigationRoute } from '../navigation/NavigationRoute';
import {
  useDiffReviewPageLink,
  useDiffReviewPageWithBoundaryLink,
} from '../navigation/Routes';
import { TwoColumnFullWidth } from '../layouts/TwoColumnFullWidth';
import { DocumentationRootPage } from './DocumentationPage';
import { ContributionEditingStore } from '../hooks/edit/Contributions';
import { DiffHeader } from '../diffs/DiffHeader';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { Button, Fade, List, Typography } from '@material-ui/core';
import { useUndocumentedUrls } from '../hooks/diffs/useUndocumentedUrls';
import { UndocumentedUrl } from '../diffs/UndocumentedUrl';
import {
  SharedDiffStore,
  useSharedDiffContext,
} from '../hooks/diffs/SharedDiffContext';
import { useEffect } from 'react';
import { EndpointRow } from '../documentation/EndpointName';
import { CenteredColumn } from '../layouts/CenteredColumn';
import { AuthorIgnoreRules } from '../diffs/AuthorIgnoreRule';

export function DiffReviewPages(props: any) {
  const diffReviewPageLink = useDiffReviewPageLink();
  const diffReviewPageWithBoundaryLink = useDiffReviewPageWithBoundaryLink();

  return (
    <SharedDiffStore>
      <ContributionEditingStore>
        <>
          <NavigationRoute
            path={diffReviewPageLink.path}
            Component={DiffUrlsPage}
            AccessoryNavigation={() => <div></div>}
          />
          <NavigationRoute
            path={diffReviewPageWithBoundaryLink.path}
            Component={DiffUrlsPage}
            AccessoryNavigation={() => <div></div>}
          />
        </>
      </ContributionEditingStore>
    </SharedDiffStore>
  );
}

export function DiffUrlsPage(props: any) {
  const urls = useUndocumentedUrls();
  const { documentEndpoint } = useSharedDiffContext();

  const name = `${urls.filter((i) => !i.hide).length} unmatched URL observed`;

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
                onFinish={(pattern, method) =>
                  documentEndpoint(pattern, method)
                }
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
