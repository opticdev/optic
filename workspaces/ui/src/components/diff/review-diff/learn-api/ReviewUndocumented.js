import React from 'react';
import { useDiffSession } from '../ReviewDiffSession';
import { LearnAPIPageInner } from './LearnAPIPageInner';

//undocumented Learn UI but for the new UI
export function ReviewUndocumentedUrls(props) {
  const { queries, actions } = useDiffSession();
  const undocumentedUrls = queries.undocumentedUrls();

  const urls = undocumentedUrls.map((i) => ({
    method: i.method,
    path: i.path,
    count: i.count,
    id: rowId(i),
  }));

  return (
    <LearnAPIPageInner
      urls={urls}
      onChange={(status) => {
        console.log(status);
        actions.updateToDocument(status.toDocument, status.handled);
      }}
    />
  );
}

function rowId(row) {
  return `${row.path + row.method + '__new__'}`;
}
