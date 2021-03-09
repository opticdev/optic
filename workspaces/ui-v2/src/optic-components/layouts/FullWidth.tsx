import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';

export function FullWidth(props: any) {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.wrapper} style={props.style}>
      {props.children}
    </Container>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',

    alignItems: 'flex-start',
    paddingTop: 25,
    paddingLeft: 15,
    paddingRight: 15,
  },
}));
