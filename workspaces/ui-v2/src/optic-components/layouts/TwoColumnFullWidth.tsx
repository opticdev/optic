import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container, Paper } from '@material-ui/core';

type TwoColumnFullWidthProps = {
  left: any;
  right: any;
  style?: any;
};

export function TwoColumnFullWidth(props: TwoColumnFullWidthProps) {
  const classes = useStyles();

  return (
    <Container
      maxWidth={false}
      fullWidth
      className={classes.wrapper}
      style={props.style}
    >
      <Paper square className={classes.left}>
        {props.left}
      </Paper>
      <div className={classes.right}>{props.right}</div>
    </Container>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingRight: 0,
  },
  left: {
    flex: 1,
    maxWidth: 630,
    height: 'calc(100vh - 40px)',
    overflow: 'scroll',
  },
  right: { flex: 1 },
}));
