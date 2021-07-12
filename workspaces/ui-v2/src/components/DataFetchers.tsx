import React, { FC } from 'react';
import { createFlatList } from '<src>/components/FieldOrParameter';
import { useShapeDescriptor } from '<src>/hooks/useShapeDescriptor';
import { IFieldDetails } from '<src>/components';

type ContributionFetcherProps = {
  rootShapeId: string;
  endpointId: string;
  changesSinceBatchCommit?: string;
  children: (fieldList: IFieldDetails[]) => React.ReactNode;
};

// TODO QPB replace this by fetching the contributions in redux
export const ContributionFetcher: FC<ContributionFetcherProps> = ({
  rootShapeId,
  endpointId,
  children,
  changesSinceBatchCommit,
}) => {
  const shapes = useShapeDescriptor(rootShapeId, changesSinceBatchCommit);
  const fieldList = createFlatList(shapes, endpointId);

  return <>{children(fieldList)}</>;
};

type ShapeFetcherProps = {
  rootShapeId: string;
  changesSinceBatchCommit?: string;
  children: (shapes: ReturnType<typeof useShapeDescriptor>) => React.ReactNode;
};

// TODO QPB replace this by fetching the shapes in redux
export const ShapeFetcher: FC<ShapeFetcherProps> = ({
  rootShapeId,
  changesSinceBatchCommit,
  children,
}) => {
  const shapes = useShapeDescriptor(rootShapeId, changesSinceBatchCommit);
  return <>{children(shapes)}</>;
};
