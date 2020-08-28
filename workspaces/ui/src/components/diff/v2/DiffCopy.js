import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { mapScala } from '@useoptic/domain';
import { UpdatedBlue, UpdatedBlueBackground } from '../../../theme';
import { track } from '../../../Analytics';

export function DiffCopy(props) {
  const classes = useStyles();

  const copy = props.copy;
  const fontSize = props.fontSize || 13;

  let suggestion = ""
  const components = mapScala(copy)((i) => {
    suggestion += i.value + " "
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

  useEffect(() => {
    track("Showing recommendation", {suggestion})
  }, [])

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
