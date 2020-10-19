import React from 'react';
import theme from '../../decorators/theme';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import { DocDarkGrey } from '../../../components/docs/DocConstants';
import {
  AddedDarkGreen,
  AddedGreen,
  ChangedYellow,
  primary,
  RemovedRed,
  secondary,
} from '../../../theme';
import { coverageDot } from './dummy-data';

export default {
  title: 'Coverage/ Diff Count',
  decorators: [theme],
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'Ubuntu Mono',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 900,
    justifyContent: 'flex-end',
  },
}));

export function DiffCounter({ added, changed, removed }) {
  const classes = useStyles();
  if (!added && !changed && !removed) {
    return null;
  }
  return (
    <div className={classes.root}>
      {added && (
        <div style={{ marginLeft: 6, color: AddedDarkGreen }}> ﹢{added} </div>
      )}
      {changed && (
        <div style={{ marginLeft: 6, color: ChangedYellow }}> Δ{changed} </div>
      )}
      {removed && (
        <div style={{ marginLeft: 6, color: RemovedRed }}> ─{removed} </div>
      )}
    </div>
  );
}
