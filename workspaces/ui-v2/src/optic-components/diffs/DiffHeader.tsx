import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Divider, Typography } from '@material-ui/core';
import { SubtleBlueBackground } from '../theme';
export type DiffHeaderProps = {
  name: string;
  children?: any;
};

export function DiffHeader({ name, children }: DiffHeaderProps) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.header}>
        <Typography color="primary" className={classes.headerText}>
          {name}
        </Typography>
        <div style={{ flex: 1 }} />
        <div>{children}</div>
      </div>
      <Divider />
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  header: {
    padding: 9,
    backgroundColor: SubtleBlueBackground,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 600,
    fontSize: 12,
    paddingLeft: 5,
    fontFamily: 'Ubuntu',
  },
  bgColor: {},
}));
