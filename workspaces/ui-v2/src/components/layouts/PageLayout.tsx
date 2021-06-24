import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TopNavigation } from '<src>/components/navigation/TopNavigation';

type PageLayoutProps = {
  AccessoryNavigation?: FC;
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
    flex: 1,
    height: '100%',
  },
}));
