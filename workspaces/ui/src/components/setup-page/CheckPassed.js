import React from 'react';
import { Dialog, DialogContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Code } from './setup-api/CodeBlock';

export function CheckPassed(props) {
  const classes = useStyles();
  return (
    <Dialog open={true}>
      <DialogContent className={classes.root}>
        <Typography variant="h6" style={{ color: '#e2e2e2' }}>
          Check Passed! Your <Code>api start</Code> command is all set up.
        </Typography>
        next steps...
      </DialogContent>
    </Dialog>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 15,
    backgroundColor: '#0e2a35',
  },
}));
