import React, { useMemo, useState } from 'react';
import {
  useDiffReviewPagePendingEndpoint,
  useEndpointPageLink,
} from '../../../navigation/Routes';
import { useHistory } from 'react-router-dom';
import groupBy from 'lodash.groupby';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/styles';
import { Check } from '@material-ui/icons';
import { pathToRegexp } from 'path-to-regexp';

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
import { useSharedDiffContext } from '../../../hooks/diffs/SharedDiffContext';
import { AuthorIgnoreRules } from '../../../diffs/AuthorIgnoreRule';
import { FixedSizeList } from 'react-window';
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
} from './components/EndpointNameEditFields';
import { UndocumentedUrl } from './components/UndocumentedUrl';
import { makePattern } from './utils';

import { useAnalytics } from '<src>/analytics';

export function DiffUrlsPage(props: any) {
  const urls = useUndocumentedUrls();
  const history = useHistory();
  const { documentEndpoint, wipPatterns } = useSharedDiffContext();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();
  const classes = useStyles();
  const analytics = useAnalytics();

  const [searchQuery, setSearchQuery] = useState('');
  const matchers = Object.entries(wipPatterns)
    .filter(([, { isParameterized }]) => isParameterized)
    .map(([pathMethod, { components, method }]) => ({
      pathMethod,
      matcher:
        (console.log(makePattern(components)),
        pathToRegexp(makePattern(components))),
      method,
    }));

  const dedupedUrls = urls.filter((url) => {
    return matchers.every(
      ({ pathMethod, matcher, method }) =>
        pathMethod === url.path + url.method ||
        !(matcher.test(url.path) && method === url.method)
    );
  });
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const unmatchedUrlLengths = dedupedUrls.filter((i) => !i.hide).length;

  const shownUrls = dedupedUrls
    .filter((url) => url.path.startsWith(searchQuery))
    .filter((i) => !i.hide);

  const name = `${unmatchedUrlLengths} unmatched URLs observed${
    shownUrls.length !== dedupedUrls.length
      ? `. Showing ${shownUrls.length}`
      : ''
  }`;

  return (
    <TwoColumnFullWidth
      left={
        <>
          <DiffHeader name={name}>
            <Box display="flex" flexDirection="row">
              <TextField
                size="small"
                value={searchQuery}
                inputProps={{ style: { fontSize: 10, width: 140 } }}
                placeholder="filter urls"
                onChange={(e) => {
                  const newValue = e.target.value.replace(/\s+/g, '');
                  if (!newValue.startsWith('/')) {
                    setSearchQuery('/' + newValue);
                  } else {
                    setSearchQuery(newValue);
                  }
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
                    itemData={{
                      handleSelection: (pattern: string, method: string) => {
                        if (bulkMode) {
                          // TODO document, and add analytics
                          // TODO change to selection
                          // stageEndpoint(pendingId);
                        } else {
                          const pendingId = documentEndpoint(pattern, method);
                          analytics.userDocumentedEndpoint(bulkMode);
                          const link = diffReviewPagePendingEndpoint.linkTo(
                            pendingId
                          );
                          history.push(link);
                        }
                      },
                      undocumentedUrls: shownUrls,
                      isBulkMode: bulkMode,
                    }}
                  >
                    {UndocumentedUrl}
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
