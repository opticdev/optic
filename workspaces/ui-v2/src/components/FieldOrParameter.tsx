import React, { FC } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { IShapeRenderer } from '<src>/types';
import { EditableTextField, TextFieldVariant } from './EditableTextField';
import { IContribution } from '<src>/types';

export type FieldOrParameterProps = {
  shapes: IShapeRenderer[];
  name: string;
  depth: number;
  value: string;
  setValue?: (newValue: string) => void;
  isEditing?: boolean;
};

export const FieldOrParameter: FC<FieldOrParameterProps> = ({
  name,
  shapes,
  depth,
  value,
  setValue = () => {},
  isEditing = false,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.container} style={{ paddingLeft: depth * 14 }}>
      <div className={classes.topRow}>
        <div className={classes.keyName}>{name}</div>
        <div className={classes.shape}>{summarizeTypes(shapes)}</div>
      </div>
      <EditableTextField
        isEditing={isEditing}
        value={value}
        setValue={setValue}
        defaultText={`What is ${name}? How is it used?`}
        variant={TextFieldVariant.FIELDORPARAM}
      />
    </div>
  );
};

function summarizeTypes(shapes: IShapeRenderer[]) {
  if (shapes.length === 1) {
    return shapes[0].jsonType.toString().toLowerCase();
  } else {
    const allShapes = shapes.map((i) => i.jsonType.toString().toLowerCase());
    const last = allShapes.pop();
    return allShapes.join(', ') + ' or ' + last;
  }
}

export interface IFieldDetails {
  name: string;
  contribution: IContribution;
  shapes: IShapeRenderer[];
  depth: number;
}

export function createFlatList(
  shapes: IShapeRenderer[],
  endpointId: string,
  depth: number = 0
): IFieldDetails[] {
  const fieldDetails: IFieldDetails[] = [];

  shapes.forEach((shape) => {
    if (shape.asObject) {
      shape.asObject.fields.forEach((field) => {
        fieldDetails.push({
          name: field.name,
          contribution: {
            id: field.fieldId,
            contributionKey: 'description',
            value: field.contributions.description || '',
            endpointId: endpointId,
          },
          depth,
          shapes: field.shapeChoices,
        });

        fieldDetails.push(
          ...createFlatList(field.shapeChoices, endpointId, depth + 1)
        );
      });
    }
    if (shape.asArray) {
      fieldDetails.push(
        ...createFlatList(shape.asArray.shapeChoices, endpointId, depth + 1)
      );
    }
  });

  return fieldDetails;
}

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: 9,
    paddingLeft: 3,
    borderTop: '1px solid #e4e8ed',
  },
  keyName: {
    color: '#3c4257',
    fontWeight: 600,
    fontSize: 13,
    fontFamily: 'Ubuntu',
  },
  shape: {
    marginLeft: 6,
    fontFamily: 'Ubuntu Mono',
    fontSize: 12,
    fontWeight: 400,
    color: '#8792a2',
    height: 18,
    marginTop: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 6,
  },
}));
