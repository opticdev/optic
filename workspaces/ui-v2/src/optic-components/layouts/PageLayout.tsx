import React, { FC, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TopNavigation } from '<src>/optic-components/navigation/TopNavigation';

type PageLayoutProps = {
  AccessoryNavigation: ReactNode;
};

export const PageLayout: FC<PageLayoutProps> = ({
  children,
  AccessoryNavigation,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <TopNavigation AccessoryNavigation={AccessoryNavigation} />
      <div className={classes.scroll}>{children}</div>
    </div>
  );
};

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
