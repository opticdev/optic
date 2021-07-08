import React, { FC } from 'react';
import { createFlatList } from '<src>/components/FieldOrParameter';
import { useShapeDescriptor } from '<src>/hooks/useShapeDescriptor';
import { IShapeRenderer } from '<src>/components';

type ContributionFetcherProps = {
  rootShapeId: string;
  endpointId: string;
  changesSinceBatchCommit?: string;
  // TODO QPB change this typing - currently this holds contributions, and the data for rendering the shape
  children: (
    contributions: {
      id: string;
      contributionKey: string;
      value: string;
      endpointId: string;
      depth: number;
      name: string;
      shapes: IShapeRenderer[];
    }[]
  ) => React.ReactNode;
};

// TODO QPB replace this by fetching the contributions in redux
export const ContributionFetcher: FC<ContributionFetcherProps> = ({
  rootShapeId,
  endpointId,
  children,
  changesSinceBatchCommit,
}) => {
  const shapes = useShapeDescriptor(rootShapeId, changesSinceBatchCommit);
  const contributions = createFlatList(shapes);
  const contributionsMapped = contributions.map((contribution) => ({
    id: contribution.contributionId,
    contributionKey: 'description',
    value: contribution.description,
    endpointId: endpointId,
    depth: contribution.depth,
    name: contribution.name,
    shapes: contribution.shapes,
  }));

  return <>{children(contributionsMapped)}</>;
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
