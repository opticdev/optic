import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { useBatchCommits } from '<src>/optic-components/hooks/useBatchCommits';
import { useDocumentationPageLink } from '<src>/optic-components/navigation/Routes';

export const ValidateBatchId: FC<{ batchId: string }> = ({
  children,
  batchId,
}) => {
  const allBatchCommits = useBatchCommits();
  const documentationPageLink = useDocumentationPageLink();
  const validBatchId = allBatchCommits.batchCommits.some(
    (i) => i.batchId === batchId
  );

  if (allBatchCommits.loading) {
    return null;
  }

  if (!validBatchId) {
    return <Redirect to={documentationPageLink.path} />;
  }

  return <>{children}</>;
};
