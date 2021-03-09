import * as React from 'react';
import { LightBlueBackground, OpticBlueReadable } from '../theme';
import { LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

export function Loading(props: any) {
  const classes = useStyles();
  return <LinearProgress variant="indeterminate" />;
}

const useStyles = makeStyles((theme) => ({}));
