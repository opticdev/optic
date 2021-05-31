import React from 'react';
import { CenteredColumn } from '../layouts/CenteredColumn';
import { makeStyles } from '@material-ui/styles';
import { Box, Typography } from '@material-ui/core';
import { SpinningOpticLogo } from './SpinningOpticLogo';

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
      <SpinningOpticLogo />
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
  padded: {
    padding: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
