import React from 'react';
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import {
  AddedGreen,
  SubtleBlueBackground,
  SubtleGreyBackground,
} from '../../../theme';
import { DocDarkGrey } from '../../docs/DocConstants';
import { Divider } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { LightTooltip } from '../../tooltips/LightTooltip';

export function SubtleEndpointTOC(props) {
  const { groupings } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={4} square>
      <Section title="req" />
      <Section title="200" />
      <Section title="404" />
    </Paper>
  );
}

export function Section(props) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.heading}>{props.title}</div>
      <RegionIndicator colorClassName={classes.added} />
      <RegionIndicator colorClassName={classes.added} />
      <div style={{ width: 10 }} />
    </>
  );
}

export function RegionIndicator(props) {
  const classes = useStyles();
  return (
    <LightTooltip title="LOOK AT ME">
      <div className={classNames(classes.rect, props.colorClassName)} />
    </LightTooltip>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 35,
    position: 'sticky',
    top: 0,
    backgroundColor: SubtleBlueBackground,
    paddingLeft: 2,
    paddingRight: 20,
    transition: 'width .2s ease',
    overflow: 'scroll',
    // '&:hover': {
    //   width: 140,
    //   transition: 'width .7s ease',
    // },
  },
  heading: {
    color: DocDarkGrey,
    fontFamily: 'Ubuntu Mono',
    textTransform: 'lowercase',
    fontWeight: 900,
    marginRight: 7,
  },
  added: {
    backgroundColor: AddedGreen,
    opacity: 0.7,
  },
  rect: {
    margin: 1,
    height: 10,
    marginRight: 5,
    width: 10,
    cursor: 'pointer',
    borderRadius: 20,
  },
}));
