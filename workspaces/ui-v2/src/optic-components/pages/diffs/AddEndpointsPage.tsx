import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDiffReviewPagePendingEndpoint } from '../../navigation/Routes';
import { useHistory } from 'react-router-dom';

import { TwoColumnFullWidth } from '../../layouts/TwoColumnFullWidth';
import { DocumentationRootPage } from '../docs/DocumentationPage';
import { DiffHeader } from '../../diffs/DiffHeader';
import { Box, List, TextField } from '@material-ui/core';
import { useUndocumentedUrls } from '../../hooks/diffs/useUndocumentedUrls';
import { UndocumentedUrl } from '../../diffs/UndocumentedUrl';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { AuthorIgnoreRules } from '../../diffs/AuthorIgnoreRule';
import { useDebounce } from '../../hooks/ui/useDebounceHook';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
// @ts-ignore
import AutoSizer from 'react-virtualized-auto-sizer';

export function DiffUrlsPage(props: any) {
  const urls = useUndocumentedUrls();
  const history = useHistory();
  const { documentEndpoint } = useSharedDiffContext();
  const diffReviewPagePendingEndpoint = useDiffReviewPagePendingEndpoint();

  const [filteredUrls, setFilteredUrls] = useState(urls);

  const shownUrls = filteredUrls.filter((i) => !i.hide);

  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    const data = shownUrls[index];

    return (
      <UndocumentedUrl
        style={style}
        {...data}
        key={data.method + data.path}
        onFinish={(pattern, method) => {
          const pendingId = documentEndpoint(pattern, method);
          const link = diffReviewPagePendingEndpoint.linkTo(pendingId);
          setTimeout(() => history.push(link), 500);
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
      right={<DocumentationRootPage />}
    />
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
