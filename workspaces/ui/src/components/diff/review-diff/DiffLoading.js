import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { primary } from '../../../theme';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { DocDarkGrey } from '../../docs/DocConstants';

export function DiffLoading({ show }) {
  const classes = useStyles();

  // if (!show) {
  //   return null;
  // }

  return (
    <div className={classes.root}>
      <div className={classes.top}>
        <Skeleton variant="rect" height={80} />
      </div>
      <div className={classes.sideBySide}>
        <Skeleton
          variant="rect"
          height={550}
          component="div"
          className={classes.textParent}
        >
          <Typography
            component="div"
            className={classes.text}
            variant="overline"
          >
            Waiting for Next Diff...
          </Typography>
        </Skeleton>
        <div style={{ width: 20 }} />
        <Skeleton variant="rect" width={250} height={200} />
      </div>
    </div>
  );
}

export function DiffLoadingOverview({ show }) {
  const classes = useStyles();

  if (!show) {
    return null;
  }

  return (
    <div className={classes.rootOverview}>
      <Skeleton
        variant="rect"
        height={60}
        component="div"
        style={{ marginTop: 12 }}
      />

      <Skeleton
        variant="rect"
        height={60}
        component="div"
        style={{ marginTop: 12 }}
      />
      <Skeleton
        variant="rect"
        height={60}
        component="div"
        style={{ marginTop: 12 }}
      />
      <Skeleton
        variant="rect"
        height={60}
        component="div"
        style={{ marginTop: 12 }}
      />
    </div>
  );
}

export function DiffReviewLoading({ show }) {
  const classes = useStyles();

  if (!show) {
    return null;
  }

  return (
    <div className={classes.rootUnder}>
      <div className={classes.sideBySide}>
        <Skeleton
          variant="rect"
          height={550}
          component="div"
          className={classes.textParent}
          withChildren={{
            withChildren: classes.withChildren,
          }}
        >
          <Typography
            component="div"
            className={classes.text}
            variant="overline"
            style={{ visibility: 'inherit' }}
          >
            Loading Example and Diff...
          </Typography>
        </Skeleton>
        <div style={{ width: 20 }} />
        <Skeleton variant="rect" width={250} height={200} />
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  rootOverview: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  rootUnder: {
    width: '100%',
    marginTop: 70,
  },
  text: {
    margin: '0 auto',
    fontSize: 20,
    fontWeight: 400,
    color: '#959191',
    visibility: 'inherit !important',
  },
  textParent: {
    display: 'flex',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 'inherit',
    alignItems: 'center',
  },
  top: {
    paddingBottom: 20,
  },
  sideBySide: {
    display: 'flex',
    maxWidth: 'inherit',
    flexDirection: 'row',
  },
  withChildren: {
    visibility: 'inherit',
  },
}));
