import * as React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import padLeft from 'pad-left';
import { methodColorsDark } from '../theme';
import {
  ListItem,
} from '@material-ui/core';
import { EndpointNameMiniContribution } from './Contributions';
export type EndpointNameProps = {
  method: string;
  fullPath: string;
  fontSize?: number;
  leftPad?: number;
};

export function EndpointName({
  method,
  fullPath,
  fontSize = 13,
  leftPad = 10,
}: EndpointNameProps) {
  const classes = useStyles();

  const paddedMethod = padLeft(method, leftPad, ' ');
  const color = methodColorsDark[method.toUpperCase()];
  return (
    <div className={classes.wrapper}>
      <div
        className={classes.method}
        style={{ color, fontSize }}
      >
        {paddedMethod.toUpperCase()}
      </div>
      <div className={classes.fullPath} style={{ fontSize }}>
        {fullPath}
      </div>
    </div>
  );
}

export type EndpointRowProps = {
  method: string;
  endpointId: string;
  fullPath: string;
  onClick: () => void;
};

export function EndpointRow({
  method,
  fullPath,
  endpointId,
  onClick,
}: EndpointRowProps) {
  const classes = useStyles();

  return (
    <ListItem
      button
      disableRipple
      disableGutters
      style={{ display: 'flex' }}
      onClick={onClick}
    >
      <div style={{ flex: 1 }}>
        <EndpointName method={method} fullPath={fullPath} leftPad={4} />
      </div>
      <div style={{ paddingRight: 15 }}>
        <EndpointNameMiniContribution
          id={endpointId}
          defaultText="name for this endpoint"
          contributionKey="purpose"
        />
      </div>
    </ListItem>
  );
}

const useStyles = makeStyles((theme) => ({
  method: {
    whiteSpace: 'pre',
    fontFamily: 'Ubuntu Mono',
  },
  endpointName: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Ubuntu',
    pointerEvents: 'none',
    color: '#2a2f45',
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
