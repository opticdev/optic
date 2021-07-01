import React, { FC } from 'react';
import {
  RouteComponentProps,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import classNames from 'classnames';

import { CenteredColumn, EndpointName, PageLayout } from '<src>/components';
import {
  Box,
  List,
  ListItem,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { useChangelogStyles } from '<src>/pages/changelog/components/ChangelogBackground';
import { useEndpointsChangelog } from '<src>/hooks/useEndpointsChangelog';
import { selectors, useAppSelector } from '<src>/store';
import { IEndpointWithChanges } from '<src>/types';

import {
  ChangelogPageAccessoryNavigation,
  ValidateBatchId,
} from './components';
import { useGroupedEndpoints } from '<src>/hooks/useGroupedEndpoints';

export const ChangelogListPage: FC<
  RouteComponentProps<{
    batchId: string;
  }>
> = (props) => {
  return (
    <PageLayout AccessoryNavigation={ChangelogPageAccessoryNavigation}>
      <ValidateBatchId batchId={props.match.params.batchId}>
        <ChangelogRootPage
          {...props}
          changelogBatchId={props.match.params.batchId}
        />
      </ValidateBatchId>
    </PageLayout>
  );
};

export function ChangelogRootPage(props: { changelogBatchId: string }) {
  const endpointsState = useAppSelector((state) => state.endpoints.results);
  const changelog = useEndpointsChangelog(props.changelogBatchId);
  const filteredAndMappedEndpoints = selectors.filterRemovedEndpointsForChangelogAndMapChanges(
    endpointsState.data || [],
    changelog
  );
  const history = useHistory();
  const match = useRouteMatch();

  const groupedEndpoints = useGroupedEndpoints(filteredAndMappedEndpoints);

  const tocKeys = Object.keys(groupedEndpoints).sort();
  const changelogStyles = useChangelogStyles();
  const styles = useStyles();

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
      <List dense>
        {tocKeys.map((tocKey) => {
          return (
            <div key={tocKey}>
              <Typography
                variant="h6"
                style={{ fontFamily: 'Ubuntu Mono', fontWeight: 600 }}
              >
                {tocKey}
              </Typography>
              {groupedEndpoints[tocKey].map(
                (endpoint: IEndpointWithChanges, index: number) => {
                  return (
                    <ListItem
                      key={index}
                      button
                      disableRipple
                      disableGutters
                      style={{ display: 'flex' }}
                      onClick={() =>
                        history.push(
                          `${match.url}/paths/${endpoint.pathId}/methods/${endpoint.method}`
                        )
                      }
                      className={classNames({
                        [changelogStyles.added]: endpoint.changes === 'added',
                        [changelogStyles.updated]:
                          endpoint.changes === 'updated',
                        [changelogStyles.removed]:
                          endpoint.changes === 'removed',
                      })}
                    >
                      <div style={{ flex: 1 }}>
                        <EndpointName
                          method={endpoint.method}
                          fullPath={endpoint.fullPath}
                          leftPad={6}
                        />
                      </div>
                      <div style={{ paddingRight: 15 }}>
                        <Typography className={styles.smallField}>
                          {endpoint.purpose || 'Unnamed Endpoint'}
                        </Typography>
                      </div>
                    </ListItem>
                  );
                }
              )}
            </div>
          );
        })}
      </List>
    </CenteredColumn>
  );
}

const useStyles = makeStyles((theme) => ({
  smallField: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Ubuntu',
    pointerEvents: 'none',
    color: '#2a2f45',
  },
}));
