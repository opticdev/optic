import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow,
  ChangedYellowBackground,
  RemovedRedBackground,
} from '../theme';
import { IChanges } from './IChanges';
import classNames from 'classnames';

export function ChangeLogBG(props: { changes?: IChanges; children: any }) {
  const classes = useStyles();

  const { changes } = props;
  return (
    <div
      className={classNames(
        { [classes.added]: changes && changes.added },
        { [classes.changed]: changes && changes.changed },
      )}
    >
      {props.children}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  added: {
    borderLeft: `1px solid ${AddedGreen}`,
    padding: 9,
    backgroundColor: `${AddedGreenBackground} !important`,
  },
  changed: {
    borderLeft: `1px solid ${ChangedYellow}`,
    paddingLeft: 9,
    paddingBottom: 9,
    backgroundColor: `${ChangedYellowBackground} !important`,
  },
  removed: {
    backgroundColor: `${RemovedRedBackground} !important`,
  },
}));
