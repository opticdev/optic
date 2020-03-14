import React from 'react';
import {Grid, makeStyles} from '@material-ui/core';
import {StickyRegion} from '../shared/StickyRegion';
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

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
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 40,
    borderRight: '1px solid #e2e2e2',
    maxWidth: 'inherit',
  },
  rightDiff: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 20,
    maxWidth: 'inherit',
  },
  maxWidth: {
    maxWidth: 600,
    width: '100%'
  },
  largeMaxWidth: {
    width: '90%'
  },
  rightDiffSticky: {
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    overflow: 'scroll',
    height: '100vh'
  },
  leftDiffScroll: {
    paddingLeft: 15,
    paddingRight: 15,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    overflow: 'scroll',
    height: '100vh'
  },
  scroll: {
    overflow: 'scroll',
    paddingBottom: 300,
    paddingTop: 20,
  },
  scrollCol: {
    flexGrow: 1,
    overflow: 'auto',
    minHeight: '100%'
  },
  independentScroll: {
    width: '50%',
    // minHeight: 'min-content',
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    flex: 1,
    display: 'flex',
    overflow: 'auto',
  },
  diffDoc: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 800
  }
}));

export function DocGrid({left, right, style}) {

  const classes = useStyles();

  return (
    <Grid container style={style}>
      <Grid item md={6} sm={12} className={classes.left}>{left}</Grid>
      <Grid item md={6} sm={12} className={classes.right}>{right}</Grid>
    </Grid>
  );
}

export function DiffDocGrid({left, leftColor, right, active, style, colMaxWidth}) {

  const classes = useStyles();

  return (
    <ScrollIntoViewIfNeeded active={active} options={{behavior: 'instant'}}>
      <Grid container style={style}>
        <Grid item xs={6} className={classes.leftDiff} alignItems="center">
          <div className={classes.maxWidth} style={{maxWidth: colMaxWidth}}>{left}</div>
        </Grid>
        <Grid item xs={6} className={classes.rightDiff} alignItems="center">
          <div className={classes.maxWidth} style={{maxWidth: colMaxWidth}}>{right}</div>
        </Grid>
      </Grid>
    </ScrollIntoViewIfNeeded>
  );
}

export function DiffDoc({active, children}) {

  const classes = useStyles();

  return (
      <div className={classes.diffDoc}>
        <ScrollIntoViewIfNeeded active={false} options={{behavior: 'instant'}}>
        {children}
        </ScrollIntoViewIfNeeded>
      </div>
  );
}

export function DiffDocGridRightSticky({left, leftColor, right, style}) {

  const classes = useStyles();

  return (
    <Grid container style={style}>
      <Grid item xs={6} className={classes.leftDiffScroll} alignItems="center">
        <div className={classes.largeMaxWidth}>{left}</div>
      </Grid>
      <Grid item xs={6} className={classes.rightDiffSticky} alignItems="center">
        <StickyRegion className={classes.largeMaxWidth}>
          <div>{right}</div>
        </StickyRegion>
      </Grid>
    </Grid>
  );
}
