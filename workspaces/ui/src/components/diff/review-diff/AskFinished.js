import React, { useContext, useEffect, useMemo } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import { useHistory } from 'react-router-dom';
import { useDiffSession } from './ReviewDiffSession';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { TextFields } from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import {
  LightBlueBackground,
  OpticBlueReadable,
  SubtleBlueBackground,
} from '../../../theme';
import Card from '@material-ui/core/Card';
import { useMachine } from '@xstate/react';
import { newApplyChangesMachine } from '../../../engine/async-work/apply-changes-machine';
import { RfcContext } from '../../../contexts/RfcContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Stat } from '../v2/CaptureManagerPage';
import Divider from '@material-ui/core/Divider';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function AskFinished(props) {
  const { setAskFinish } = props;
  const history = useHistory();
  const { queries, services } = useDiffSession();
  const { clientSessionId, clientId } = useContext(RfcContext);
  const classes = useStyles();

  const patch = queries.endpointsWithSuggestions();

  const [state, send] = useMachine(
    newApplyChangesMachine(patch, services, clientSessionId, clientId)
  );

  useEffect(() => {
    console.log('look here', state);
  }, [state]);

  const isComplete = state.matches('completed');
  useEffect(() => {
    if (isComplete) {
      const { updatedEvents } = state.context;
      debugger;
    }
  }, [isComplete]);

  const start = () => send({ type: 'START' });

  const handleClose = () => {
    setAskFinish(false);
  };

  const handleFinalize = () => {
    setAskFinish(false);
    // history.push(baseDiffReviewPath + '/finalize');
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="sm"
      fullWidth
      style={{ padding: 0 }}
    >
      <div className={classes.root}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          style={{
            backgroundColor: LightBlueBackground,
            padding: 12,
            border: `1px solid #e2e2e2`,
            width: '100%',
          }}
        >
          <div className={classes.logoWrapper}>
            <PulsingOpticHuge />
            <Typography variant="h6">Finalize Changes</Typography>
          </div>
          <div style={{ flexShrink: 1 }}>
            {isComplete ? (
              <Button color="primary" variant="contained" onClick={handleClose}>
                Done
              </Button>
            ) : (
              <Button
                color="secondary"
                disabled={state.value !== 'staged'}
                endIcon={<PlayArrowIcon />}
                variant="contained"
                onClick={start}
              >
                Apply
              </Button>
            )}
          </div>
        </Box>

        {state.matches('staged') && (
          <Box style={{ padding: 12, width: '100%' }}>
            <TextField multiline fullWidth label="Describe your changes..." />
            <div style={{ marginTop: 20 }}>
              this will be the list of changes...
            </div>
          </Box>
        )}

        {state.matches('generatingNewPaths') ||
          (state.matches('generatingNewBodyCommands') && (
            <GeneratingNewPaths
              endpointIds={state.context.newPaths.endpointIds}
              newBodiesProgress={state.context.newBodiesProgress}
              newBodiesProgressLastLearned={
                state.context.newBodiesProgressLastLearned
              }
            />
          ))}

        {state.matches('runningCommands') && <UpdatingSpec />}

        {state.matches('completed') && (
          <Results
            oasStats={state.context.oasStats}
            newEndpoints={patch.added.length}
          />
        )}
      </div>
    </Dialog>
  );
}

function GeneratingNewPaths(props) {
  const {
    endpointIds,
    newBodiesProgress,
    newBodiesProgressLastLearned,
  } = props;
  const classes = useStyles();
  return (
    <div className={classes.commonStatus}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Typography variant="subtitle1" style={{ fontWeight: 400 }}>
          Learning New Endpoints ({newBodiesProgress} / {endpointIds.length})
        </Typography>
        <div style={{ width: 250, marginLeft: 20, marginTop: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(newBodiesProgress / endpointIds.length) * 100}
          />
        </div>
      </Box>
      <Typography
        variant="caption"
        style={{ fontFamily: 'Ubuntu Mono', fontWeight: 200 }}
      >
        {newBodiesProgressLastLearned}
      </Typography>
    </div>
  );
}

function UpdatingSpec(props) {
  const classes = useStyles();
  return (
    <div className={classes.commonStatus}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Typography variant="subtitle1" style={{ fontWeight: 400 }}>
          Updating Specification...
        </Typography>
        <div style={{ width: 250, marginLeft: 20, marginTop: 2 }}>
          <LinearProgress variant="indeterminate" />
        </div>
      </Box>
    </div>
  );
}

function Results(props) {
  const { oasStats, newEndpoints } = props;
  const classes = useStyles();
  return (
    <div className={classes.commonStatus}>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6" color="primary" style={{ fontWeight: 400 }}>
          Done! All Changes Saved
        </Typography>
        {oasStats && newEndpoints > 0 ? (
          <div>
            <Divider style={{ marginTop: 5, marginBottom: 10 }} />
            <div style={{ padding: 20 }}>
              <Typography variant="body1" color="primary">
                <Typography variant="h6" color="textPrimary">
                  {newEndpoints} endpoints added to the specification. In total,
                  there are <Stat number={oasStats.oasLineCount} label="line" />{' '}
                  of OpenAPI that Optic keeps keep up-to-date for your team!
                </Typography>

                <div
                  style={{
                    display: 'flex',
                    margin: '0 auto',
                    paddingTop: 20,
                    justifyContent: 'space-around',
                  }}
                >
                  <StatMini number={oasStats.requests} label="total request" />
                  <StatMini
                    number={oasStats.responses}
                    label="total response"
                  />
                  <StatMini number={oasStats.fields} label="total field" />
                </div>
              </Typography>
            </div>
          </div>
        ) : null}
      </Box>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commonStatus: {
    padding: 12,
    width: '100%',
    minHeight: 80,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  logoWrapper: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const PulsingOpticHuge = () => (
  <div className={'blobMedium'} style={{ marginRight: 9 }}>
    <img src="/optic-logo.svg" width={50} height={50} />
  </div>
);

const StatMini = ({ number, label }) => {
  return (
    <span>
      {number !== 0 && (
        <Typography
          variant="h6"
          component="span"
          color="secondary"
          style={{ fontWeight: 800 }}
        >
          {number}{' '}
        </Typography>
      )}
      <Typography
        variant="h6"
        component="span"
        style={{ fontWeight: 800 }}
        color="primary"
      >
        {number === 0 && 'no '}
        {label}
        {number === 1 ? '' : 's'}
      </Typography>
    </span>
  );
};
