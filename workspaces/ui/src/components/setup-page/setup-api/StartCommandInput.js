import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { useCodeInputStyles } from './sharedStyles';
import { Typography } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import { Code } from './CodeBlock';
import { RemovedRed, secondary } from '../../../theme';

export function StartCommandInput({ onChange, placeholder, value, error }) {
  const classes = useCodeInputStyles();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <Paper
      component="form"
      className={classes.root}
      style={{ border: error && `1px solid ${secondary}` }}
    >
      <IconButton disabled>
        <AttachMoneyIcon />
      </IconButton>
      <InputBase
        error={error}
        value={value}
        onKeyDown={(e) => {
          if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={classes.input}
        placeholder={'i.e. ' + placeholder}
        onChange={(e) => {
          let newValue = e.target.value;
          if (newValue.endsWith('$OPT')) {
            newValue = newValue + 'IC_API_PORT ';
          }
          onChange(newValue);
          setShowHelper(true);
        }}
        onBlur={() => setShowHelper(false)}
      />
      <Fade in={showHelper}>
        <Typography
          variant="caption"
          style={{ paddingRight: 6, fontWeight: 400 }}
        >
          If your command takes a <Code>--port</Code> flag, set it to{' '}
          <Code>$OPTIC_API_PORT</Code>
        </Typography>
      </Fade>
    </Paper>
  );
}
