import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Typography } from '@material-ui/core';
import { useFeatureStyles } from './featureStyles';

const useStyles = makeStyles((theme) => ({
  highlightSpan: {
    background: `linear-gradient(180deg,rgba(255,255,255,0) 50%, rgba(43,123,209,.24) 50%)`,
  },
  root: {
    fontSize: 22,
    fontWeight: 300,
    marginBottom: 22,
  },
}));

export const HighlightSpan = ({ start, end }) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {start}
      <span className={classes.highlightSpan}>{end}</span>
    </div>
  );
};
