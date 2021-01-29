import React from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';
import {primary, SubtleBlueBackground, UpdatedBlueBackground} from './theme';

const useStyles = makeStyles((theme) => ({
  copybtn: {
    // position: 'absolute',
    color: primary,
  },
  root: {
    overflow: 'none',
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: SubtleBlueBackground,
  },
  codeInline: {
    padding: 3,
    paddingLeft: 5,
    paddingRight: 5,
    fontWeight: 100,
    backgroundColor: UpdatedBlueBackground,
    fontFamily: 'Ubuntu Mono',
  },
}));

export const Code = (props) => {
  const classes = useStyles();
  return <span className={classes.codeInline}>{props.children}</span>;
};
