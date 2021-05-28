import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PageLayout } from '<src>/optic-components/layouts/PageLayout';
import { DocumentationRootPage } from '../docs/DocumentationRootPage';

import {
  ChangelogPageAccessoryNavigation,
  ValidateBatchId,
} from './components';

export const ChangelogListPage: FC<
  RouteComponentProps<{
    batchId: string;
  }>
> = (props) => {
  return (
    <PageLayout AccessoryNavigation={ChangelogPageAccessoryNavigation}>
      <ValidateBatchId batchId={props.match.params.batchId}>
        <DocumentationRootPage
          {...props}
          changelogBatchId={props.match.params.batchId}
        />
      </ValidateBatchId>
    </PageLayout>
  );
};
