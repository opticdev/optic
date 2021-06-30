import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import { FontFamilyMono } from '<src>/styles';

type PanelProps = {
  header: React.ReactNode;
};

export const Panel: FC<PanelProps> = ({ children, header }) => {
  const classes = useStyles();
  return (
    <div className={classes.wrapper}>
      <div className={classes.header}>
        <div>{header}</div>
      </div>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  wrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  header: {
    display: 'flex',
    backgroundColor: '#e4e8ed',
    color: '#4f566b',
    fontSize: theme.typography.fontSize - 1,
    height: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    fontFamily: FontFamilyMono,
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottom: '1px solid #e2e2e2',
  },
  content: {
    backgroundColor: '#f8fafc',
    padding: theme.spacing(1),
    maxHeight: '80vh',
    overflowY: 'auto',
    borderLeft: '1px solid #e4e8ed',
    borderRight: '1px solid #e4e8ed',
    borderBottom: '1px solid #e4e8ed',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
}));
