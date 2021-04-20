import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  useDiffReviewPagePendingEndpoint,
  useEndpointPageLink,
} from '../../navigation/Routes';
import { useHistory } from 'react-router-dom';
import groupBy from 'lodash.groupby';
import { TwoColumnFullWidth } from '../../layouts/TwoColumnFullWidth';
import { DiffHeader } from '../../diffs/DiffHeader';
import {
  Box,
  Divider,
  List,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
import { useUndocumentedUrls } from '../../hooks/diffs/useUndocumentedUrls';
import { UndocumentedUrl } from '../../diffs/UndocumentedUrl';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { AuthorIgnoreRules } from '../../diffs/AuthorIgnoreRule';
import { useDebounce } from '../../hooks/ui/useDebounceHook';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
// @ts-ignore
import AutoSizer from 'react-virtualized-auto-sizer';
import { IEndpoint, useEndpoints } from '../../hooks/useEndpointsHook';
import { Loading } from '../../navigation/Loading';
import { CenteredColumn } from '../../layouts/CenteredColumn';
import { EndpointRow } from '../../documentation/EndpointName';
import { getEndpointId } from '../../utilities/endpoint-utilities';
import { IPendingEndpoint } from '../../hooks/diffs/SharedDiffState';

export function DiffUrlsPage(props: any) {
  const urls = useUndocumentedUrls();
  const history = useHistory();
  const {
    documentEndpoint,
    stageEndpoint,
    pendingEndpoints,
  } = useSharedDiffContext();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  const [filteredUrls, setFilteredUrls] = useState(urls);

  useEffect(() => {
    setFilteredUrls(urls);
  }, [pendingEndpoints.length, urls]);

  const [bulkMode, setBulkMode] = useState<boolean>(false);

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
          if (autolearn) {
            stageEndpoint(pendingId);
            setBulkMode(bulkMode);
          } else {
            const link = diffReviewPagePendingEndpoint.linkTo(pendingId);
            setTimeout(() => history.push(link), 500);
          }
        }}
      />
    );
  }

  const name = `${urls.filter((i) => !i.hide).length} unmatched URLs observed${
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

  const { pendingEndpoints } = useSharedDiffContext();
  const pendingEndpointsToRender = pendingEndpoints.filter((i) => i.staged);

  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();
  const grouped = useMemo(() => groupBy(endpoints, 'group'), [endpoints]);
  const tocKeys = Object.keys(grouped).sort();

  const history = useHistory();
  const endpointPageLink = useEndpointPageLink();

  if (loading) {
    return <Loading />;
  }

  return (
    <CenteredColumn maxWidth="md" style={{ marginTop: 35 }}>
      <List dense>
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
                  <EndpointRow
                    key={index}
                    changelog={{ added: true }}
                    onClick={() =>
                      history.push(
                        diffReviewPagePendingEndpoint.linkTo(endpoint.id),
                      )
                    }
                    fullPath={endpoint.pathPattern}
                    method={endpoint.method}
                    endpointId={getEndpointId({
                      method: endpoint.method,
                      pathId: endpoint.id,
                    })}
                  />
                );
              },
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
                  <EndpointRow
                    key={index}
                    onClick={() =>
                      history.push(
                        endpointPageLink.linkTo(
                          endpoint.pathId,
                          endpoint.method,
                        ),
                      )
                    }
                    fullPath={endpoint.fullPath}
                    method={endpoint.method}
                    endpointId={getEndpointId({
                      method: endpoint.method,
                      pathId: endpoint.pathId,
                    })}
                  />
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
