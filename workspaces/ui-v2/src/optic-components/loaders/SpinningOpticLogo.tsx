import React from 'react';
import { makeStyles } from '@material-ui/styles';

export function SpinningOpticLogo() {
  const classes = useStyles();
  return (
    <img
      className={classes.spinningImg}
      src={'/optic-logo-loader.svg'}
      width={30}
      height={30}
      alt="loader"
    />
  );
}

const useStyles = makeStyles((theme) => ({
  spinningImg: {
    animation: '$spin 5s infinite linear',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}));
