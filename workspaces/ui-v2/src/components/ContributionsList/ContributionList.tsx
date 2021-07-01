import React, { FC } from 'react';
import { IShapeRenderer } from '<src>/components';

type Contribution = {
  id: string;
  contributionKey: string;
  value: string;
  endpointId: string;
  depth: number;
  shapes: IShapeRenderer[];
  name: string;
};

type ContributionsListProps = {
  contributions: Contribution[];
  ContributionComponent: FC<Contribution>;
};

export const ContributionsList: FC<ContributionsListProps> = ({
  contributions,
  ContributionComponent,
}) => {
  // TODO virtualize this list
  return (
    <>
      {contributions.map((contribution) => (
        <ContributionComponent
          key={contribution.id + contribution.value}
          {...contribution}
        />
      ))}
    </>
  );
};
