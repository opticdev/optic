import React, { useEffect, useMemo, useState } from 'react';
import {
  useDiffReviewPagePendingEndpoint,
  useEndpointPageLink,
} from '../../../navigation/Routes';
import { useHistory } from 'react-router-dom';
import groupBy from 'lodash.groupby';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { Check } from '@material-ui/icons';

import { TwoColumnFullWidth } from '../../../layouts/TwoColumnFullWidth';
import { DiffHeader } from '../../../diffs/DiffHeader';
import {
  Box,
  Divider,
  List,
  ListItem,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
import { useUndocumentedUrls } from '../../../hooks/diffs/useUndocumentedUrls';
import { UndocumentedUrl } from '../../../diffs/UndocumentedUrl';
import { useSharedDiffContext } from '../../../hooks/diffs/SharedDiffContext';
import { AuthorIgnoreRules } from '../../../diffs/AuthorIgnoreRule';
import { useDebounce } from '../../../hooks/ui/useDebounceHook';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
// @ts-ignore
import AutoSizer from 'react-virtualized-auto-sizer';
import { IEndpoint, useEndpoints } from '../../../hooks/useEndpointsHook';
import { Loading } from '../../../loaders/Loading';
import { CenteredColumn } from '../../../layouts/CenteredColumn';
import { EndpointName } from '../../../common';
import { IPendingEndpoint } from '../../../hooks/diffs/SharedDiffState';
import { useChangelogStyles } from '../../../changelog/ChangelogBackground';
import { useRunOnKeypress } from '<src>/optic-components/hooks/util';

import {
  ExistingEndpointNameField,
  PendingEndpointNameField,
} from './EndpointNameEditFields';
import { useAnalytics } from '<src>/analytics';

export function DiffUrlsPage(props: any) {
  const urls = useUndocumentedUrls();
  const history = useHistory();
  const {
    documentEndpoint,
    stageEndpoint,
    pendingEndpoints,
  } = useSharedDiffContext();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();
  const classes = useStyles();
  const analytics = useAnalytics();

  const [filteredUrls, setFilteredUrls] = useState(urls);

  useEffect(() => {
    setFilteredUrls(urls);
  }, [pendingEndpoints.length, urls]);

  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const unmatchedUrlLengths = urls.filter((i) => !i.hide).length;

  const shownUrls = filteredUrls.filter((i) => !i.hide);

  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    const data = shownUrls[index];

    return (
      <UndocumentedUrl
        style={style}
        bulkMode={bulkMode}
        {...data}
        key={data.method + data.path}
        onFinish={(pattern, method, autolearn) => {
          const pendingId = documentEndpoint(pattern, method);
          analytics.userDocumentedEndpoint(autolearn);
          if (autolearn) {
            stageEndpoint(pendingId);
            setBulkMode(bulkMode);
          } else {
            const link = diffReviewPagePendingEndpoint.linkTo(pendingId);
            history.push(link);
          }
        }}
      />
    );
  }

  const name = `${unmatchedUrlLengths} unmatched URLs observed${
    shownUrls.length !== urls.length ? `. Showing ${shownUrls.length}` : ''
  }`;

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader name={name}>
            <Box display="flex" flexDirection="row">
              <UrlFilterInput
                onDebouncedChange={(query) => {
                  setFilteredUrls(urls.filter((i) => i.path.startsWith(query)));
                }}
              />
              <div style={{ marginLeft: 13 }}>
                <Typography
                  variant="subtitle2"
                  component="span"
                  color="primary"
                  style={{ fontWeight: 600, fontSize: 11 }}
                >
                  {' '}
                  bulk mode
                </Typography>
                <Switch
                  value={bulkMode}
                  onChange={(e: any) => setBulkMode(e.target.checked)}
                  color="primary"
                  size="small"
                />{' '}
              </div>
            </Box>
          </DiffHeader>

          <div style={{ flex: 1 }}>
            {shownUrls.length > 0 ? (
              <AutoSizer>
                {({ height, width }: any) => (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemSize={47}
                    itemCount={shownUrls.length}
                  >
                    {renderRow}
                  </FixedSizeList>
                )}
              </AutoSizer>
            ) : unmatchedUrlLengths === 0 ? (
              <div className={classes.noResultsContainer}>
                <Check fontSize="large" />
                All observed endpoints have been documented
              </div>
            ) : (
              <div className={classes.noResultsContainer}>
                No urls match the current filter
              </div>
            )}
          </div>
          <AuthorIgnoreRules />
        </>
      }
      right={<DocumentationRootPageWithPendingEndpoints />}
    />
  );
}

export function DocumentationRootPageWithPendingEndpoints(props: any) {
  const { endpoints, loading } = useEndpoints();

  const {
    pendingEndpoints,
    setCommitModalOpen,
    hasDiffChanges,
  } = useSharedDiffContext();
  const pendingEndpointsToRender = pendingEndpoints.filter((i) => i.staged);
  const classes = useStyles();

  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();
  const grouped = useMemo(() => groupBy(endpoints, 'group'), [endpoints]);
  const tocKeys = Object.keys(grouped).sort();
  const changelogStyles = useChangelogStyles();

  const history = useHistory();
  const endpointPageLink = useEndpointPageLink();
  const onKeyPress = useRunOnKeypress(
    () => {
      if (hasDiffChanges()) {
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

  return (
    <CenteredColumn maxWidth="md" style={{ marginTop: 35 }}>
      <List dense onKeyPress={onKeyPress}>
        {pendingEndpointsToRender.length > 0 && (
          <div style={{ paddingBottom: 25 }}>
            <Typography
              variant="subtitle2"
              style={{ fontFamily: 'Ubuntu Mono' }}
            >
              Recently Added
            </Typography>
            {pendingEndpointsToRender.map(
              (endpoint: IPendingEndpoint, index: number) => {
                return (
                  <ListItem
                    key={index}
                    button
                    disableRipple
                    disableGutters
                    style={{ display: 'flex' }}
                    onClick={() =>
                      history.push(
                        diffReviewPagePendingEndpoint.linkTo(endpoint.id)
                      )
                    }
                    className={classNames(
                      changelogStyles.added,
                      classes.endpointRow
                    )}
                  >
                    <div className={classes.endpointNameContainer}>
                      <EndpointName
                        method={endpoint.method}
                        fullPath={endpoint.pathPattern}
                        leftPad={6}
                      />
                    </div>
                    <div
                      className={classes.endpointContributionContainer}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PendingEndpointNameField endpoint={endpoint} />
                    </div>
                  </ListItem>
                );
              }
            )}
            <Divider style={{ marginTop: 15 }} />
          </div>
        )}
        {tocKeys.map((tocKey) => {
          return (
            <div key={tocKey}>
              <Typography
                variant="subtitle2"
                style={{ fontFamily: 'Ubuntu Mono' }}
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
                        endpointPageLink.linkTo(
                          endpoint.pathId,
                          endpoint.method
                        )
                      )
                    }
                    className={classes.endpointRow}
                  >
                    <div className={classes.endpointNameContainer}>
                      <EndpointName
                        method={endpoint.method}
                        fullPath={endpoint.fullPath}
                        leftPad={6}
                      />
                    </div>
                    <div
                      className={classes.endpointContributionContainer}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExistingEndpointNameField endpoint={endpoint} />
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

function UrlFilterInput(props: { onDebouncedChange: (value: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { onDebouncedChange } = props;
  const debouncedSearchQuery = useDebounce(searchQuery, 600);

  useEffect(() => {
    if (debouncedSearchQuery) {
      onDebouncedChange(debouncedSearchQuery);
    }
    // eslint-disable-next-line
  }, [debouncedSearchQuery]);

  return (
    <TextField
      size="small"
      value={searchQuery}
      inputProps={{ style: { fontSize: 10, width: 140 } }}
      placeholder="filter urls"
      onChange={(e: any) => {
        const newValue = e.target.value.replace(/\s+/g, '');
        if (!newValue.startsWith('/')) {
          setSearchQuery('/' + newValue);
        } else {
          setSearchQuery(newValue);
        }
      }}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  endpointRow: {
    display: 'flex',
    '@media (max-width: 1250px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
  endpointNameContainer: {
    overflowX: 'scroll',
    flexGrow: 1,
  },
  endpointContributionContainer: {
    paddingRight: 15,
    '@media (max-width: 1250px)': {
      paddingLeft: 20,
    },
  },
  noResultsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    flexDirection: 'column',
  },
}));
