import React, { FC } from 'react';
import { Redirect } from 'react-router-dom';
import { useBatchCommits } from '<src>/optic-components/hooks/useBatchCommits';
import { useBaseUrl } from '<src>/optic-components/hooks/useBaseUrl';

export const ValidateBatchId: FC<{ batchId: string }> = ({
  children,
  batchId,
}) => {
  const allBatchCommits = useBatchCommits();
  const baseUrl = useBaseUrl();
  const validBatchId = allBatchCommits.batchCommits.some(
    (i) => i.batchId === batchId
  );

  if (allBatchCommits.loading) {
    return null;
  }

  if (!validBatchId) {
    return <Redirect to={`${baseUrl}/documentation`} />;
  }

  return <>{children}</>;
};
