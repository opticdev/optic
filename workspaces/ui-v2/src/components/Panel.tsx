import React, { FC } from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core';
import { FontFamilyMono } from '<src>/styles';

type PanelProps = {
  header: React.ReactNode;
};

export const Panel: FC<
  PanelProps & React.HtmlHTMLAttributes<HTMLDivElement>
> = ({ children, header, className, ...props }) => {
  const classes = useStyles();
  return (
    <div {...props} className={classNames(classes.wrapper, className)}>
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
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderTopRightRadius: theme.shape.borderRadius * 2,
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
    borderBottomRightRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
  },
}));
