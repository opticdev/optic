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
import { Divider, List, ListItem, Typography } from '@material-ui/core';
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

import { AddEndpointDiffHeader } from './components/AddEndpointDiffHeader';
import {
  ExistingEndpointNameField,
  PendingEndpointNameField,
} from './components/EndpointNameEditFields';
import { UndocumentedUrl } from './components/UndocumentedUrl';
import { makePattern } from './utils';

import { useAnalytics } from '<src>/analytics';

export function DiffUrlsPage() {
  const urls = useUndocumentedUrls();
  const history = useHistory();
  const { documentEndpoint, wipPatterns } = useSharedDiffContext();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();
  const classes = useStyles();
  const analytics = useAnalytics();
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const matchers = Object.entries(wipPatterns)
    .filter(([, { isParameterized }]) => isParameterized)
    .map(([pathMethod, { components, method }]) => ({
      pathMethod,
      matcher: pathToRegexp(makePattern(components)),
      method,
    }));

  // TODO move this to shared diff context - this needs to be shared between
  const dedupedUrls = urls
    .filter((url) => {
      return matchers.every(
        ({ pathMethod, matcher, method }) =>
          pathMethod === url.path + url.method ||
          !(matcher.test(url.path) && method === url.method)
      );
    })
    .filter((i) => !i.hide);
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const unmatchedUrlLengths = dedupedUrls.length;
  const visibleUrls = dedupedUrls.filter((url) =>
    url.path.startsWith(searchQuery)
  );
  const bulkSelectedUrls = dedupedUrls.filter((url) =>
    selectedUrls.has(url.path + url.method)
  );

  // TODO pull out into hook + use enum for checked and unchecked
  const checkboxState = visibleUrls.every((url) =>
    selectedUrls.has(url.path + url.method)
  )
    ? 'checked'
    : visibleUrls.every((url) => !selectedUrls.has(url.path + url.method))
    ? 'not_checked'
    : 'indeterminate';

  const toggleSelectAllCheckbox = () => {
    setSelectedUrls((previousState) => {
      const newState = new Set(previousState);
      for (const { path, method } of visibleUrls) {
        if (checkboxState === 'not_checked') {
          newState.add(path + method);
        } else {
          newState.delete(path + method);
        }
      }

      return newState;
    });
  };

  return (
    <TwoColumnFullWidth
      left={
        <>
          <AddEndpointDiffHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            bulkMode={bulkMode}
            setBulkMode={setBulkMode}
            numberOfUnmatchedUrl={unmatchedUrlLengths}
            numberOfVisibleUrls={visibleUrls.length}
            numberOfSelectedUrls={bulkSelectedUrls.length}
            checkboxState={checkboxState}
            toggleSelectAllCheckbox={toggleSelectAllCheckbox}
          />
          <div style={{ flex: 1 }}>
            {visibleUrls.length > 0 ? (
              <AutoSizer>
                {({ height, width }: any) => (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemSize={47}
                    itemCount={visibleUrls.length}
                    itemKey={(index, data) => {
                      const item = data.undocumentedUrls[index];
                      return item.method + item.path;
                    }}
                    itemData={{
                      handleBulkModeSelection: (
                        path: string,
                        method: string
                      ) => {
                        setSelectedUrls((previousState) => {
                          const key = path + method;
                          const newState = new Set(previousState);
                          newState.has(key)
                            ? newState.delete(key)
                            : newState.add(key);
                          return newState;
                        });
                      },
                      handleSelection: (pattern: string, method: string) => {
                        const pendingId = documentEndpoint(pattern, method);
                        analytics.userDocumentedEndpoint(bulkMode);
                        const link = diffReviewPagePendingEndpoint.linkTo(
                          pendingId
                        );
                        history.push(link);
                      },
                      undocumentedUrls: visibleUrls,
                      isBulkMode: bulkMode,
                      isSelected: (path: string, method: string) =>
                        selectedUrls.has(`${path}${method}`),
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

export function DocumentationRootPageWithPendingEndpoints() {
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
