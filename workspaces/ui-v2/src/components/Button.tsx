import React, { FC, ComponentProps } from 'react';
import {
  Button as MuiButton,
  CircularProgress,
  makeStyles,
} from '@material-ui/core';

type ButtonProps = ComponentProps<typeof MuiButton> & {
  loading?: boolean;
};

export const Button: FC<ButtonProps> = ({ children, loading, ...props }) => {
  const classes = useStyles();
  return (
    <MuiButton {...props}>
      {loading ? (
        <CircularProgress className={classes.loading} size={20} />
      ) : (
        children
      )}
    </MuiButton>
  );
};

const useStyles = makeStyles((theme) => ({
  loading: {
    marginLeft: theme.spacing(1),
  },
}));
