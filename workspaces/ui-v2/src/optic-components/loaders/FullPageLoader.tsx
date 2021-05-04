import React from 'react';
import { CenteredColumn } from '../layouts/CenteredColumn';
import { makeStyles } from '@material-ui/styles';
import { Box, Typography } from '@material-ui/core';

interface ILoaderProps {
  title: string;
}

export function FullPageLoader({ title }: ILoaderProps) {
  const classes = useStyles();
  return (
    <CenteredColumn maxWidth="md">
      <div className={classes.center}>
        <LoaderWithOpticLogo title={title} />
      </div>
    </CenteredColumn>
  );
}

export function Loader({ title }: ILoaderProps) {
  const classes = useStyles();
  return (
    <div className={classes.padded}>
      <LoaderWithOpticLogo title={title} />
    </div>
  );
}

export function LoaderWithOpticLogo({ title }: ILoaderProps) {
  const classes = useStyles();
  return (
    <Box display="flex">
      <img
        className={classes.spinningImg}
        src={'/optic-logo-loader.svg'}
        width={30}
        height={30}
        alt="loader"
      />
      <Typography variant="h6" color="textSecondary" className={classes.text}>
        {title}...
      </Typography>
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 40px)',
  },
  text: {
    marginLeft: 10,
    marginTop: -1,
    fontFamily: 'Ubuntu Mono',
  },
  spinningImg: {
    animation: '$spin 5s infinite linear',
  },
  padded: {
    padding: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}));
