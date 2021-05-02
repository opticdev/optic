import React, { FC, ReactNode } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { IPathParameter } from '../hooks/useEndpointsHook';
import { Divider, Typography } from '@material-ui/core';

export type PathParametersProps = {
  parameters: IPathParameter[];
  renderField: (pathParam: IPathParameter, index: number) => ReactNode;
};

export const PathParameters: FC<PathParametersProps> = ({
  parameters,
  renderField,
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
