import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { IPathParameter } from '../hooks/useEndpointsHook';
import { Divider, Typography } from '@material-ui/core';
import { FieldOrParameterContribution } from './Contributions';
import { IShapeRenderer, JsonLike } from '../shapes/ShapeRenderInterfaces';

export type PathParametersViewEditProps = {
  parameters: IPathParameter[];
};

export function PathParametersViewEdit(props: PathParametersViewEditProps) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography className={classes.h6}>Path Parameters</Typography>
      {props.parameters.length === 0 && (
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

      {props.parameters.map((param, index) => {
        const alwaysAString: IShapeRenderer = {
          shapeId: param.pathComponentId + 'shape',
          jsonType: JsonLike.STRING,
          value: undefined,
        };
        return (
          <FieldOrParameterContribution
            key={index}
            id={param.pathComponentId}
            name={param.pathComponentName}
            shapes={[alwaysAString]}
            depth={0}
            // TODO - implement when query params are added
            initialValue=""
          />
        );
      })}
    </div>
  );
}

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
