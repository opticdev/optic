import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { StickyRegion } from './StickyRegion';

const useStyles = makeStyles(theme => ({
  right: {
    paddingTop: 25,
    maxWidth: 650,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 20,
      paddingTop: 15,
      maxWidth: 'inherit'
    },
  },
  leftDiff: {
    paddingTop: 15,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 15,
    paddingRight: 15,
    borderRight: '1px solid #e2e2e2',
    maxWidth: 'inherit'
  },
  rightDiff: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    maxWidth: 'inherit'
  },
  maxWidth: {
    maxWidth: 600,
    width: '100%'
  }
}));

export function DocGrid({ left, right, style }) {

  const classes = useStyles();

  return (
    <Grid container style={style}>
      <Grid item md={6} sm={12} className={classes.left}>{left}</Grid>
      <Grid item md={6} sm={12} className={classes.right}>{right}</Grid>
    </Grid>
  );
}

export function DiffDocGrid({ left, leftColor, right, style }) {

  const classes = useStyles();

  return (
    <Grid container style={style}>
      <Grid item xs={6} className={classes.leftDiff} alignItems="center">
        <StickyRegion>
          <div className={classes.maxWidth}>
            {left}
          </div>
        </StickyRegion>
      </Grid>
      <Grid item xs={6} className={classes.rightDiff} alignItems="center">
        <div className={classes.maxWidth}>{right}</div>
      </Grid>
    </Grid>
  );
}

