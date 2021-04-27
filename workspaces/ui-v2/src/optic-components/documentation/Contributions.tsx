import * as React from 'react';
import { ChangeEvent } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { TextField } from '@material-ui/core';
import { IShapeRenderer } from '../shapes/ShapeRenderInterfaces';
import Helmet from 'react-helmet';
import {
  useContributionEditing,
  useValueWithStagedContributions,
} from '../hooks/edit/Contributions';
import { EditableTextField, TextFieldVariant } from '../common';

export type FieldOrParameterContributionProps = {
  shapes: IShapeRenderer[];
  id: string;
  name: string;
  depth: number;
  initialValue: string;
};

export function FieldOrParameterContribution({
  name,
  id,
  shapes,
  depth,
  initialValue,
}: FieldOrParameterContributionProps) {
  const classes = useStyles();
  const contributionKey = 'description';
  const { isEditing } = useContributionEditing();

  const { value, setValue } = useValueWithStagedContributions(
    id,
    contributionKey,
    initialValue
  );

  return (
    <div className={classes.container} style={{ paddingLeft: depth * 14 }}>
      <div className={classes.topRow}>
        <div className={classes.keyName}>{name}</div>
        <div className={classes.shape}>{summarizeTypes(shapes)}</div>
      </div>
      {isEditing ? (
        <TextField
          inputProps={{ className: classes.description }}
          fullWidth
          placeholder={`What is ${name}? How is it used?`}
          multiline
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
          }}
        />
      ) : (
        <div className={classes.description}>{value}</div>
      )}
    </div>
  );
}

export type EndpointNameContributionProps = {
  id: string;
  contributionKey: string;
  defaultText: string;
  requiredError?: string;
  initialValue: string;
};

export function EndpointNameContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
}: EndpointNameContributionProps) {
  const { isEditing, setEditing } = useContributionEditing();
  const { value, setValue } = useValueWithStagedContributions(
    id,
    contributionKey,
    initialValue
  );

  return (
    <>
      <Helmet>
        <title>{value || 'Unnamed Endpoint'}</title>
      </Helmet>
      <EditableTextField
        isEditing={isEditing}
        setEditing={setEditing}
        value={value}
        setValue={setValue}
        helperText="Help consumers by naming this endpoint"
        defaultText={defaultText}
        variant={TextFieldVariant.REGULAR}
      />
    </>
  );
}

export function EndpointNameMiniContribution({
  id,
  contributionKey,
  defaultText,
  initialValue,
}: EndpointNameContributionProps) {
  const { isEditing, setEditing } = useContributionEditing();

  const { value, setValue } = useValueWithStagedContributions(
    id,
    contributionKey,
    initialValue
  );

  return (
    <EditableTextField
      isEditing={isEditing}
      setEditing={setEditing}
      value={value}
      setValue={setValue}
      defaultText={defaultText}
      variant={TextFieldVariant.SMALL}
    />
  );
}

function summarizeTypes(shapes: IShapeRenderer[]) {
  if (shapes.length === 1) {
    return shapes[0].jsonType.toString().toLowerCase();
  } else {
    const allShapes = shapes.map((i) => i.jsonType.toString().toLowerCase());
    const last = allShapes.pop();
    return allShapes.join(', ') + ' or ' + last;
  }
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
  description: {
    fontFamily: 'Ubuntu',
    fontWeight: 200,
    fontSize: 14,
    lineHeight: 1.8,
    color: '#4f566b',
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
