import * as React from 'react';
import { LinearProgress } from '@material-ui/core';
import { NavigationWithChild } from '../navigation/NavigationRoute';

export function Loading(props: any) {
  return <LinearProgress variant="indeterminate" />;
}

export function LoadingPage(props: any) {
  return <NavigationWithChild>{props.children}</NavigationWithChild>;
}
