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
      render={(props: { match: any }) => {
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

export function NavigationWithChild(props: { children: any }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TopNavigation AccessoryNavigation={() => null} />
      <div className={classes.scroll}>{props.children}</div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  scroll: {
    paddingTop: 40,
    flex: 1,
    height: '100%',
  },
}));
