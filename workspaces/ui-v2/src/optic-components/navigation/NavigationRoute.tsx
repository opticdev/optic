import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Route } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';

export type NavigationRouteProps = {
  path: string;
  Component: any;
  AccessoryNavigation: any;
};

export function NavigationRoute(props: NavigationRouteProps) {
  const classes = useStyles();
  const { Component, path, AccessoryNavigation } = props;
  return (
    <Route
      path={path}
      exact
      component={(props: { match: any }) => {
        const { match } = props;
        return (
          <div className={classes.root}>
            <TopNavigation AccessoryNavigation={AccessoryNavigation} />
            <div className={classes.scroll}>
              <Component {...{ match }} />
            </div>
          </div>
        );
      }}
    />
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  scroll: {
    overflow: 'scroll',
    paddingTop: 40,
    flex: 1,
  },
}));
