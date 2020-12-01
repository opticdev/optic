import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import DoneIcon from '@material-ui/icons/Done';
import { AddedGreen } from '../../../theme';

const useStyles = makeStyles((theme) => ({
  loader: {
    display: 'flex',
    marginTop: 15,
    alignItems: 'center',
  },
}));

export function WaitingForSpinner(props) {
  const classes = useStyles();
  const { label, done, doneMessage, doneIcon } = props;

  return (
    <div className={classes.loader}>
      {done ? (
        <>
          {doneIcon || (
            <DoneIcon style={{ color: AddedGreen, marginRight: 9 }} />
          )}
          <Typography variant="h6">{doneMessage}</Typography>
        </>
      ) : (
        <>
          <CircularProgress style={{ color: '#5d5d5d' }} size={18} />
          <Typography
            variant="body1"
            style={{ color: '#5d5d5d', fontWeight: 200, marginLeft: 10 }}
          >
            Waiting for {label}...
          </Typography>
        </>
      )}
    </div>
  );
}
