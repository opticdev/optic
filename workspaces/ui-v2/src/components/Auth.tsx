import { useAuth0 } from '@auth0/auth0-react';
import { Button, CircularProgress, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  loader: {
    marginRight: theme.spacing(2),
  },
}));

export const LoginRequired: React.FC<{}> = ({ children }) => {
  const { user, isAuthenticated, isLoading, loginWithPopup } = useAuth0();
  const styles = useStyles();

  if (isLoading) {
    return <CircularProgress className={styles.loader} size={12} />;
  } else if (isAuthenticated && user) {
    return <>{children}</>;
  } else {
    return <Button onClick={loginWithPopup}>Log in</Button>;
  }
};
