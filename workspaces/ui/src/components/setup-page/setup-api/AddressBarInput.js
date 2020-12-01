import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import { useCodeInputStyles } from './sharedStyles';
const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    fontFamily: 'Ubuntu Mono',
  },
  iconButton: {
    padding: 10,
    opacity: 0.6,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export function AddressBarInput({ value, autoFocus, placeholder, onChange }) {
  const classes = useCodeInputStyles();

  return (
    <Paper component="form" className={classes.root}>
      <IconButton disabled>
        <WebAssetIcon />
      </IconButton>
      <InputBase
        value={value}
        onKeyDown={(e) => {
          if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        autoFocus={autoFocus}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className={classes.input}
        placeholder={placeholder}
      />
    </Paper>
  );
}
