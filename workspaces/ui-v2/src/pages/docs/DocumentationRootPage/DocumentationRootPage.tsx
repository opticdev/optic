import React, { FC, useEffect } from 'react';
import { Box, List, LinearProgress, Typography } from '@material-ui/core';

import { CenteredColumn, PageLayout } from '<src>/components';
import {
  useAppSelector,
  useAppDispatch,
  documentationEditActions,
  selectors,
} from '<src>/store';
import { useRunOnKeypress } from '<src>/hooks/util';
import { useGroupedEndpoints } from '<src>/hooks/useGroupedEndpoints';
import { IEndpoint } from '<src>/types';

import { DocsPageAccessoryNavigation } from '../components';
import { EndpointRow } from './EndpointRow';
import { useAnalytics } from '<src>/contexts/analytics';

export const DocumentationRootPageWithDocsNav: FC = () => (
  <PageLayout AccessoryNavigation={DocsPageAccessoryNavigation}>
    <DocumentationRootPage />
  </PageLayout>
);

export function DocumentationRootPage() {
  const analytics = useAnalytics();
  const endpointsState = useAppSelector((state) => state.endpoints.results);
  const isEditing = useAppSelector(
    (state) => state.documentationEdits.isEditing
  );
  const pendingCount = useAppSelector(
    selectors.getDocumentationEditStagedCount
  );
  const dispatch = useAppDispatch();

  const setCommitModalOpen = (commitModalOpen: boolean) => {
    dispatch(
      documentationEditActions.updateCommitModalState({
        commitModalOpen,
      })
    );
  };

  const filteredEndpoints = selectors.filterRemovedItems(
    endpointsState.data?.endpoints || []
  );

  const groupedEndpoints = useGroupedEndpoints(filteredEndpoints);
  useEffect(() => {
    analytics.documentationPageLoaded();
  }, [analytics]);
  const tocKeys = Object.keys(groupedEndpoints).sort();
  const onKeyPress = useRunOnKeypress(
    () => {
      if (isEditing && pendingCount > 0) {
        setCommitModalOpen(true);
      }
    },
    {
      keys: new Set(['Enter']),
      inputTagNames: new Set(['input']),
    }
  );

  if (endpointsState.loading) {
    return <LinearProgress variant="indeterminate" />;
  }

  if (tocKeys.length === 0) {
    return (
      <Box
        display="flex"
        height="100%"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="h6"
          style={{ fontFamily: 'Ubuntu Mono', marginBottom: '25%' }}
        >
          No endpoints have been documented yet
        </Typography>
      </Box>
    );
  }

  return (
    <CenteredColumn maxWidth="md" style={{ marginTop: 35 }}>
      <List dense onKeyPress={onKeyPress}>
        {tocKeys.map((tocKey) => {
          return (
            <div key={tocKey}>
              <Typography
                variant="h6"
                style={{ fontFamily: 'Ubuntu Mono', fontWeight: 600 }}
              >
                {tocKey}
              </Typography>
              {groupedEndpoints[tocKey].map((endpoint: IEndpoint) => (
                <EndpointRow
                  endpoint={endpoint}
                  key={endpoint.pathId + endpoint.method}
                />
              ))}
            </div>
          );
        })}
      </List>
    </CenteredColumn>
  );
}
