import React, { FC, useMemo } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import groupBy from 'lodash.groupby';
import classNames from 'classnames';
import { CenteredColumn } from '../../layouts/CenteredColumn';
import { IEndpoint, useEndpoints } from '../../hooks/useEndpointsHook';
import { Box, List, ListItem, Typography } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { EndpointName } from '../../common';
import { EndpointNameMiniContribution } from '../../documentation/Contributions';
import { useContributionEditing } from '../../hooks/edit/Contributions';
import { getEndpointId } from '../../utilities/endpoint-utilities';
import { Loading } from '../../loaders/Loading';
import { useChangelogStyles } from '../../changelog/ChangelogBackground';
import { useRunOnKeypress } from '<src>/optic-components/hooks/util';
import { PageLayout } from '<src>/optic-components/layouts/PageLayout';
import { DocsPageAccessoryNavigation } from './components';

export const DocumentationRootPageWithDocsNav: FC<
  React.ComponentProps<typeof DocumentationRootPage>
> = (props) => (
  <PageLayout AccessoryNavigation={DocsPageAccessoryNavigation}>
    <DocumentationRootPage {...props} />
  </PageLayout>
);

export function DocumentationRootPage(props: { changelogBatchId?: string }) {
  const { endpoints, loading } = useEndpoints(props.changelogBatchId);
  //@nic TODO fork changelog from documentation page
  const isChangelogPage = props.changelogBatchId !== undefined;
  const history = useHistory();
  const match = useRouteMatch();

  const {
    isEditing,
    pendingCount,
    setCommitModalOpen,
  } = useContributionEditing();

  const grouped = useMemo(() => groupBy(endpoints, 'group'), [endpoints]);
  const tocKeys = Object.keys(grouped).sort();
  const changelogStyles = useChangelogStyles();
  const styles = useStyles();
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

  if (loading) {
    return <Loading />;
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
              {grouped[tocKey].map((endpoint: IEndpoint, index: number) => {
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
                      [changelogStyles.added]:
                        isChangelogPage && endpoint.changelog?.added,
                      [changelogStyles.updated]:
                        isChangelogPage && endpoint.changelog?.changed,
                    })}
                  >
                    <div style={{ flex: 1 }}>
                      <EndpointName
                        method={endpoint.method}
                        fullPath={endpoint.fullPath}
                        leftPad={6}
                      />
                    </div>
                    <div
                      style={{ paddingRight: 15 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isChangelogPage ? (
                        <Typography className={styles.smallField}>
                          {endpoint.purpose || 'Unnamed Endpoint'}
                        </Typography>
                      ) : (
                        <EndpointNameMiniContribution
                          id={getEndpointId({
                            method: endpoint.method,
                            pathId: endpoint.pathId,
                          })}
                          defaultText="name for this endpoint"
                          contributionKey="purpose"
                          initialValue={endpoint.purpose}
                        />
                      )}
                    </div>
                  </ListItem>
                );
              })}
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
