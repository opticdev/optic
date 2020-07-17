import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { mapScala } from '@useoptic/domain';
import { UpdatedBlue, UpdatedBlueBackground } from '../../../theme';

export function DiffCopy(props) {
  const classes = useStyles();

  const copy = props.copy;
  const fontSize = props.fontSize || 13;

  const components = mapScala(copy)((i) => {
    if (i.style === 'normal') {
      return (
        <span className={classes.normal} style={{ fontSize }}>
          {i.value}{' '}
        </span>
      );
    } else if (i.style === 'code') {
      return (
        <span>
          <span className={classes.code} style={{ fontSize }}>
            {i.value}
          </span>{' '}
        </span>
      );
    }
  });

  return <div>{components}</div>;
}

const useStyles = makeStyles((theme) => ({
  normal: {
    wordBreak: 'break-word',
    fontFamily: 'Ubuntu',
  },
  code: {
    fontFamily: "'Source Code Pro', monospace",
    fontWeight: 600,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    wordBreak: 'break-word',
    backgroundColor: UpdatedBlueBackground,
  },
}));
