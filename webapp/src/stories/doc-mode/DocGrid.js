import React from 'react'
import {Grid, makeStyles} from '@material-ui/core';
const useStyles = makeStyles(theme => ({
  right: {
    paddingTop: 25,
    maxWidth: 650,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 65,
      paddingTop: 15,
      maxWidth: 'inherit'
    },
  },
}));

export function DocGrid({left, right, style}) {

  const classes = useStyles()

  return (
    <Grid container style={style}>
      <Grid item md={6} sm={12}>{left}</Grid>
      <Grid item md={6} sm={12} className={classes.right}>
        {right}
      </Grid>
    </Grid>
  )
}
