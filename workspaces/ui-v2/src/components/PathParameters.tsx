import React, { FC, ReactNode } from 'react';
import { Divider, Typography, makeStyles } from '@material-ui/core';
import { JsonLike } from '@useoptic/optic-domain';

import { FieldOrParameter } from './FieldOrParameter';

import { IPathParameter, IShapeRenderer } from '<src>/types';

export type PathParametersProps = {
  parameters: IPathParameter[];
  renderField?: (pathParam: IPathParameter, index: number) => ReactNode;
};

const defaultFieldRender = (param: IPathParameter): ReactNode => {
  const alwaysAString: IShapeRenderer = {
    shapeId: param.id + 'shape',
    jsonType: JsonLike.STRING,
  };
  return (
    <FieldOrParameter
      key={param.id}
      name={param.name}
      shapes={[alwaysAString]}
      depth={0}
      value={param.description}
    />
  );
};

export const PathParameters: FC<PathParametersProps> = ({
  parameters,
  renderField = defaultFieldRender,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography className={classes.h6}>Path Parameters</Typography>
      {parameters.length === 0 && (
        <>
          <Divider
            style={{
              marginBottom: 5,
              backgroundColor: '#e4e8ed',
            }}
          />
          <Typography className={classes.none}>No path parameters.</Typography>
        </>
      )}
      {parameters.map(renderField)}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    paddingLeft: 10,
    paddingTop: 10,
  },
  h6: {
    fontSize: 13,
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  none: {
    color: '#8792a2',
    fontSize: 12,
  },
}));
