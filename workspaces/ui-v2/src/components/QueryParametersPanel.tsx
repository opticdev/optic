import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import { IFieldRenderer, IShapeRenderer, ShapeRenderer } from './ShapeRenderer';
import { Panel } from './Panel';
import { FontFamily } from '<src>/styles';

type QueryParameters = Record<string, IFieldRenderer>;

type QueryParametersPanelProps = {
  parameters: QueryParameters;
};

// TODO QPB this should move into redux
export const convertShapeToQueryParameters = (
  shapes: IShapeRenderer[]
): QueryParameters => {
  const queryParameters: QueryParameters = {};
  if (shapes.length !== 1 || !shapes[0].asObject) {
    console.error('unexpected format for query parameters');
    return {};
  }

  for (const field of shapes[0].asObject.fields) {
    queryParameters[field.name] = field;
  }

  return queryParameters;
};

export const QueryParametersPanel: FC<QueryParametersPanelProps> = ({
  parameters,
}) => {
  const classes = useStyles();
  return (
    // TODO QPB add in query parsing strategy here?
    <Panel header={''}>
      {Object.entries(parameters).map(([key, field]) => (
        <div className={classes.queryComponentContainer}>
          <div className={classes.queryKey}>{key}</div>
          <div>
            <ShapeRenderer showExamples={false} shape={field.shapeChoices} />
          </div>
        </div>
      ))}
    </Panel>
  );
};

const useStyles = makeStyles((theme) => ({
  queryComponentContainer: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1, 0),
    display: 'flex',
    '&:not(:first-child)': {
      borderTop: '1px solid #e4e8ed',
    },
  },
  queryKey: {
    fontFamily: FontFamily,
    fontWeight: 600,
    fontSize: theme.typography.fontSize - 1,
  },
}));
