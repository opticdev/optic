import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { AllCapturesContext, AllCapturesStore } from './AllCapturesContext';
import FilterListIcon from '@material-ui/icons/FilterList';
import sortBy from 'lodash.sortby';
import time from 'time-ago';
import {
  AddedGreenBackground,
  ChangedYellowBackground,
  OpticBlueLightened,
  OpticBlueReadable,
  UpdatedBlueBackground,
} from '../../../theme';
import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import { IconButton, List, Typography } from '@material-ui/core';
import { LightTooltip } from '../../tooltips/LightTooltip';
import Collapse from '@material-ui/core/Collapse';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { useCaptureContext } from '../../../contexts/CaptureContext';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import { Link, useHistory } from 'react-router-dom';
import { useSpecService } from '../../../contexts/SpecServiceContext';
export function ReviewBatchSelect(props) {
  const classes = useStyles();
  const { total, handled } = props;
  const { captures } = useContext(AllCapturesContext);
  const history = useHistory();

  const { captureId } = useCaptureContext();
  const currentCapture = captures.find((i) => i.captureId === captureId);
  const baseUrl = useBaseUrl();

  const [anchorEl, setAnchorEl] = useState(null);
  const changeCapture = (newCaptureId) => {
    setAnchorEl(null);
    history.push(`${baseUrl}/review/${newCaptureId}`);
    window.location.reload();
  };

  return (
    <Card className={classes.bounded} elevation={0}>
      <div className={classes.current}>
        {/*<div className={classes.innerChip}>task</div>{' '}*/}
        <div className={classes.startedAt}>captured since last commit</div>
        <div style={{ flex: 1 }} />
        <ShowUpdateButton captureId={captureId} />
      </div>
      <Menu
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        classes={{ list: classes.menuListClass }}
      >
        <Typography
          variant="overline"
          color="textSecondary"
          style={{ paddingBottom: 5 }}
        >
          Filter Traffic
        </Typography>
        {captures.map((capture, index) => (
          <MenuItem
            key={'batch' + index}
            onClose={() => setAnchorEl(null)}
            dense
            style={{ padding: 0, paddingRight: 5 }}
            onClick={() => changeCapture(capture.captureId)}
          >
            <div className={classes.current}>
              <div className={classes.innerChip}>task</div>{' '}
              <div className={classes.startedAt}>
                captured {time.ago(capture.lastUpdate)}
              </div>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
}

export function ShowUpdateButton({ captureId }) {
  const [captures, setCaptures] = useState([]);
  const specService = useSpecService();
  const history = useHistory();
  const baseUrl = useBaseUrl();

  function update() {
    const task = async () => {
      try {
        const listCapturesResponse = await specService.listCaptures();
        const { captures } = listCapturesResponse;
        setCaptures(captures);
      } catch (e) {}
    };
    task();
  }

  useEffect(() => {
    window.addEventListener('focus', update);

    function cleanup() {
      window.removeEventListener('focus', update);
    }

    return cleanup;
  }, []);

  useEffect(() => {
    update();
  }, [captureId]);

  const latestCapture = captures && sortBy(captures, 'lastUpdated')[0];

  if (latestCapture && latestCapture.captureId !== captureId) {
    return (
      <Typography
        component={Link}
        to={`${baseUrl}/review/${latestCapture.captureId}`}
        variant="caption"
        color="secondary"
        style={{ marginRight: 5, textDecoration: 'none' }}
      >
        show latest
      </Typography>
    );
  } else {
    return null;
  }
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
  menuListClass: {
    padding: 5,
    paddingTop: 0,
  },
  startedAt: {
    paddingLeft: 5,
    padding: 3,
    marginRight: 3,
    paddingRight: 4,
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
