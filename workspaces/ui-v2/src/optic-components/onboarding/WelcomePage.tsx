import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  body: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
  }
}));

export default function WelcomePage() {
  const classes = useStyles();

  return (
    <div className={classes.body}>
      welcome
    </div>
  );
}
