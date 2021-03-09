import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { IShapeRenderer } from '../shapes/ShapeRenderInterfaces';
import { DepthStore } from '../shapes/DepthContext';
import { FieldOrParameterContribution } from './Contributions';

type ContributionGroupProps = { rootShape: IShapeRenderer[] };

export const ContributionGroup = ({ rootShape }: ContributionGroupProps) => {
  const classes = useStyles();
  const contributions = createFlatList(rootShape);

  return (
    <DepthStore depth={0}>
      <div className={classes.container}>
        {contributions.map((i, index) => {
          return (
            <FieldOrParameterContribution
              depth={i.depth}
              id={i.contributionId}
              name={i.name}
              shapes={i.shapes}
              key={i.contributionId + i.name + index}
            />
          );
        })}
      </div>
    </DepthStore>
  );
};

interface IContributions {
  contributionId: string;
  name: string;
  shapes: IShapeRenderer[];
  description: string;
  depth: number;
}

function createFlatList(
  shapes: IShapeRenderer[],
  depth: number = 0
): IContributions[] {
  const contributions: IContributions[] = [];

  shapes.forEach((shape) => {
    if (shape.asObject) {
      shape.asObject.fields.forEach((field) => {
        contributions.push({
          name: field.fieldKey,
          depth,
          description: field.description || '',
          shapes: field.shapeRenderers,
          contributionId: field.fieldId,
        });

        contributions.push(...createFlatList(field.shapeRenderers, depth + 1));
      });
    }
    if (shape.asArray) {
      contributions.push(...createFlatList(shape.asArray.listItem, depth + 1));
    }
  });

  return contributions;
}

const useStyles = makeStyles((theme) => ({
  container: {},
  edit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
}));
