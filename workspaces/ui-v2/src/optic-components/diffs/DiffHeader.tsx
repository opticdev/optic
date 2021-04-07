import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Divider, Typography } from '@material-ui/core';
import { SubtleBlueBackground } from '../theme';
export type DiffHeaderProps = {
  name: any;
  children?: any;
  secondary?: any;
};

export function DiffHeader({ name, children, secondary }: DiffHeaderProps) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.header}>
        <div className={classes.topRow}>
          <Typography
            color="primary"
            component="div"
            className={classes.headerText}
          >
            {name}
          </Typography>
          <div style={{ flex: 1 }} />
          <div>{children}</div>
        </div>
        {secondary && <div>{secondary}</div>}
      </div>
      <Divider />
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  header: {
    padding: 9,
    backgroundColor: SubtleBlueBackground,
  },
  topRow: {
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
