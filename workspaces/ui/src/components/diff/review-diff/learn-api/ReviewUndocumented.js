import React from 'react';
import { useDiffSession } from '../ReviewDiffSession';
import { LearnAPIPageInner } from './LearnAPIPageInner';

//undocumented Learn UI but for the new UI
export function ReviewUndocumentedUrls(props) {
  const { queries, actions } = useDiffSession();
  const unrecognizedUrls = queries.unrecognizedUrls();
  const undocumentedEndpoints = queries.undocumentedEndpoints();

  const urls = unrecognizedUrls.map((i) => ({
    method: i.method,
    path: i.path,
    count: i.count,
    id: rowId(i),
  }));

  return (
    <LearnAPIPageInner
      urls={urls}
      setAskFinish={props.setAskFinish}
      undocumentedEndpoints={undocumentedEndpoints}
      onChange={(status) => {
        actions.updateToDocument(
          status.toDocument,
          status.endpoints,
          status.handled,
          status.total
        );
      }}
    />
  );
}

function rowId(row) {
  return `${row.path + row.method + '__new__'}`;
}
