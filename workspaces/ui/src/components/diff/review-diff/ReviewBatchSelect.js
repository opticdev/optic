import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { AllCapturesContext, AllCapturesStore } from '../v2/CaptureManagerPage';
import { Code } from './ICopyRender';
import FilterListIcon from '@material-ui/icons/FilterList';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  OpticBlueLightened,
  OpticBlueReadable,
  UpdatedBlueBackground,
} from '../../../theme';
import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import { IconButton, List } from '@material-ui/core';
import { LightTooltip } from '../../tooltips/LightTooltip';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

export function ReviewBatchSelect(props) {
  const classes = useStyles();
  const { total, handled } = props;
  const { captures } = useContext(AllCapturesContext);

  const [showAll, setShowAll] = useState(false);

  return (
    <Card className={classes.bounded} elevation={0}>
      <div className={classes.current}>
        <div className={classes.innerChip}>start</div>{' '}
        <div className={classes.startedAt}>captured 10 mins ago</div>
        <div style={{ flex: 1 }} />
        <LightTooltip title="Filter Traffic">
          <IconButton
            size="small"
            onClick={() => setShowAll(true)}
            color="primary"
            style={{ width: 17, height: 17, marginRight: 3 }}
          >
            <FilterListIcon style={{ width: 17, height: 17 }} />
          </IconButton>
        </LightTooltip>
      </div>
      <Collapse in={showAll} className={classes.allCaptures}></Collapse>
    </Card>
  );
}

const useStyles = makeStyles((theme) => ({
  bounded: {
    marginLeft: 5,
    marginTop: 4,
    marginRight: 5,
    alignItems: 'flex-start',
    flexShrink: 1,
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e2e2e2',
  },
  startedAt: {
    paddingLeft: 5,
    fontWeight: 100,
  },
  current: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
  },
  innerChip: {
    padding: 3,
    paddingLeft: 4,
    marginRight: 3,
    paddingRight: 4,
    fontWeight: 700,
    color: 'white',
    backgroundColor: OpticBlueLightened,
    fontFamily: 'Ubuntu Mono',
  },
  allCaptures: {
    width: '100%',
  },
}));
