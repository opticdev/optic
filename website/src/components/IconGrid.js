import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/styles/makeStyles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  inner: {
    display: 'flex',
    flexDirection: 'row',
    paddingRight: 30,
    paddingLeft: 30,
    marginBottom: 50,
  },
  innerSlim: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 50,
  },
  subtext: {
    fontWeight: 400,
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#586069',
  },
  right: {
    paddingLeft: 15,
    paddingTop: 20,
  },
});

export function TextWithSubtext({ title, subtext }) {
  const classes = useStyles();
  return (
    <div className={classes.innerSlim}>
      <Typography variant="h6">{title}</Typography>
      <Typography className={classes.subtext} variant="subtitle1">
        {subtext}
      </Typography>
    </div>
  );
}
