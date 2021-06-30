import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';

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
    backgroundColor: '#e4e8ed',
    color: '#4f566b',
    flex: 1,
    fontSize: 13,
    height: 35,
    display: 'flex',
    fontWeight: 400,
    paddingLeft: 13,
    fontFamily: 'Roboto',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    borderBottom: '1px solid #e2e2e2',
  },
  content: {
    backgroundColor: '#f8fafc',
    paddingTop: 8,
    paddingBottom: 8,
    borderTop: 'none',
    maxHeight: '80vh',
    overflowY: 'auto',
    borderLeft: '1px solid #e4e8ed',
    borderRight: '1px solid #e4e8ed',
    borderBottom: '1px solid #e4e8ed',
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
}));
