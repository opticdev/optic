import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { CircularDiffLoaderProgress } from './CircularDiffProgress';

const pJson = require('../../../package.json');

type LoadingReviewProps = {
  cursor: number;
  total: number;
};

export function LoadingReview({ cursor, total }: LoadingReviewProps) {
  const classes = useStyles();

  return (
    <div className={classes.loading}>
      <CircularDiffLoaderProgress
        startBlue
        handled={cursor}
        total={total}
        symbol=""
      />

      <div className={classes.rightRegion}>
        <Typography variant="h6" style={{ fontWeight: 200 }}>
          Running Diff...
        </Typography>
        <Typography variant="caption" style={{ fontWeight: 200 }}>
          Diff Engine v{pJson.version}
        </Typography>
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  loading: {
    padding: 12,
    paddingTop: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rightRegion: {
    paddingLeft: 22,
    paddingRight: 22,
    marginLeft: 12,
    borderLeft: '1px solid #e2e2e2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
  },
}));
