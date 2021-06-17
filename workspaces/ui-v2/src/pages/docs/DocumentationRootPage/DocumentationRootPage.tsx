import React, { FC, useMemo } from 'react';
import groupBy from 'lodash.groupby';
import { Box, List, LinearProgress, Typography } from '@material-ui/core';

import { CenteredColumn, PageLayout } from '<src>/components';
import {
  useAppSelector,
  useAppDispatch,
  documentationEditActions,
  selectors,
} from '<src>/store';
import { useRunOnKeypress } from '<src>/hooks/util';
import { IEndpoint } from '<src>/types';
import { DocsPageAccessoryNavigation } from '../components';
import { EndpointRow } from './EndpointRow';

export const DocumentationRootPageWithDocsNav: FC = () => (
  <PageLayout AccessoryNavigation={DocsPageAccessoryNavigation}>
    <DocumentationRootPage />
  </PageLayout>
);

export function DocumentationRootPage() {
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

  const filteredEndpoints = selectors.filterRemovedEndpoints(
    endpointsState.data || []
  );

  const grouped = useMemo(() => groupBy(filteredEndpoints, 'group'), [
    filteredEndpoints,
  ]);
  const tocKeys = Object.keys(grouped).sort();
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
              {grouped[tocKey].map((endpoint: IEndpoint) => (
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
