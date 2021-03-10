import * as React from 'react';
import { LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

export function Loading(props: any) {
  return <LinearProgress variant="indeterminate" />;
}
