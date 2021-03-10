import * as React from 'react';
import { NavigationRoute } from '../navigation/NavigationRoute';
import {
  useDiffReviewPageLink,
  useDiffReviewPageWithBoundaryLink,
} from '../navigation/Routes';

export function DiffReviewPages(props: any) {
  const diffReviewPageLink = useDiffReviewPageLink();
  const diffReviewPageWithBoundaryLink = useDiffReviewPageWithBoundaryLink();

  return (
    <>
      <NavigationRoute
        path={diffReviewPageLink.path}
        Component={() => <div>HELLO WORLD</div>}
        AccessoryNavigation={() => <div></div>}
      />
      <NavigationRoute
        path={diffReviewPageWithBoundaryLink.path}
        Component={() => <div>HELLO WORLD</div>}
        AccessoryNavigation={() => <div></div>}
      />
    </>
  );
}
