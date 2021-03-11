import * as React from 'react';
import { NavigationRoute } from '../navigation/NavigationRoute';
import {
  useDiffReviewPageLink,
  useDiffReviewPageWithBoundaryLink,
} from '../navigation/Routes';
import { TwoColumnFullWidth } from '../layouts/TwoColumnFullWidth';
import { DocumentationRootPage, EndpointRootPage } from './DocumentationPage';
import { ContributionEditingStore } from '../hooks/edit/Contributions';
import { DiffHeader } from '../diffs/DiffHeader';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { Button, Fade } from '@material-ui/core';

export function DiffReviewPages(props: any) {
  const diffReviewPageLink = useDiffReviewPageLink();
  const diffReviewPageWithBoundaryLink = useDiffReviewPageWithBoundaryLink();

  return (
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
  );
}

export function DiffUrlsPage(props: any) {
  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader
            name="192 unmatched URLs observed"
            children={
              <>
                <Fade in={true}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    endIcon={<ArrowRightAltIcon />}
                  >
                    Add 0 new endpoints
                  </Button>
                </Fade>
              </>
            }
          />
        </>
      }
      right={<DocumentationRootPage />}
    />
  );
}
