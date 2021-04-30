import React from 'react';
import padLeft from 'pad-left';
import makeStyles from '@material-ui/styles/makeStyles';
import { methodColorsDark } from '../theme';

export type EndpointNameProps = {
  method: string;
  fullPath: string;
  fontSize?: number;
  leftPad?: number;
  style?: any;
};

export function EndpointName({
  method,
  fullPath,
  fontSize = 13,
  leftPad = 10,
  style,
}: EndpointNameProps) {
  const classes = useStyles();

  const paddedMethod = padLeft(method, leftPad, ' ');
  const color = methodColorsDark[method.toUpperCase()];
  return (
    <div className={classes.wrapper} style={style}>
      <div className={classes.method} style={{ color, fontSize }}>
        {paddedMethod.toUpperCase()}
      </div>
      <div className={classes.fullPath} style={{ fontSize }}>
        {fullPath}
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  method: {
    whiteSpace: 'pre',
    fontFamily: 'Ubuntu Mono',
  },
  fullPath: {
    fontFamily: 'Ubuntu Mono',
    marginLeft: 7,
    color: '#697386',
  },
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
  },
}));
