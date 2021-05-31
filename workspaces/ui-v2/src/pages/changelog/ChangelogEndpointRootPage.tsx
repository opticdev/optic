import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PageLayout } from '<src>/components';
import { EndpointRootPage } from '../docs/EndpointRootPage';

import {
  ChangelogPageAccessoryNavigation,
  ValidateBatchId,
} from './components';

export const ChangelogEndpointRootPage: FC<
  RouteComponentProps<{
    batchId: string;
    pathId: string;
    method: string;
  }>
> = (props) => {
  return (
    <PageLayout AccessoryNavigation={ChangelogPageAccessoryNavigation}>
      <ValidateBatchId batchId={props.match.params.batchId}>
        <EndpointRootPage
          {...props}
          changelogBatchId={props.match.params.batchId}
          isChangelogPage={true}
        />
      </ValidateBatchId>
    </PageLayout>
  );
};
