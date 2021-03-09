import * as React from 'react'; import { useEffect, useRef, useState } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Paper } from '@material-ui/core';
import { IShapeRenderer } from '../shapes/ShapeRenderInterfaces';
import { RenderRootShape, ShapeRowBase } from '../shapes/ShapeRowBase';
import { ShapeRenderStore } from '../shapes/ShapeRenderContext';
import { ChoiceTabs } from '../shapes/OneOfTabs';

export type TwoColumnProps = {
  left: any;
  right: any;
  style?: any;
};

export function TwoColumn(props: TwoColumnProps) {
  const classes = useStyles();
  return (
    <div className={classes.container} style={props.style}>
      <div className={classes.left}>{props.left}</div>
      <div className={classes.right}>{props.right}</div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  left: {
    flex: 1,
    paddingRight: 20,
  },
  right: {
    flex: 1,
    top: 10,
    position: 'sticky',
    alignSelf: 'flex-start',
  },
}));
