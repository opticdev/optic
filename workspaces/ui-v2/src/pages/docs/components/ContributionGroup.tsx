import * as React from 'react';
import { IShapeRenderer } from '<src>/components/ShapeRenderer/ShapeRenderInterfaces';
import { createFlatList } from '<src>/components/FieldOrParameter';
import { DocsFieldOrParameterContribution } from './Contributions';

type ContributionGroupProps = { rootShape: IShapeRenderer[] };

export const ContributionGroup = ({ rootShape }: ContributionGroupProps) => {
  const contributions = createFlatList(rootShape);

  return (
    <div>
      {contributions.map((i, index) => {
        return (
          <DocsFieldOrParameterContribution
            depth={i.depth}
            id={i.contributionId}
            name={i.name}
            shapes={i.shapes}
            key={i.contributionId + i.name + index}
            initialValue={i.description}
          />
        );
      })}
    </div>
  );
};
