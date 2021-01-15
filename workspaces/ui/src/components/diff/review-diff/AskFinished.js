import React, { useContext, useEffect, useMemo } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { useHistory } from 'react-router-dom';
import { useDiffSession } from './ReviewDiffSession';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import {
  AddedGreen,
  ChangedYellow,
  LightBlueBackground,
  OpticBlueReadable,
  SubtleBlueBackground,
} from '../../../theme';
import { useMachine } from '@xstate/react';
import { newApplyChangesMachine } from '../../../engine/async-work/apply-changes-machine';
import { RfcContext } from '../../../contexts/RfcContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import { useServices } from '../../../contexts/SpecServiceContext';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import { useFinalizeSummaryContext } from './FinalizeSummaryContext';
import { PathAndMethod } from './PathAndMethod';
import {
  useAnalyticsHook,
  useApiNameAnalytics,
} from '../../../utilities/useAnalyticsHook';

export function AskFinished(props) {
  const { setAskFinish } = props;
  const history = useHistory();
  const { setSummary } = useFinalizeSummaryContext();
  const { specService } = useServices();
  const baseUrl = useBaseUrl();
  const { queries, services } = useDiffSession();
  const { clientSessionId, clientId, eventStore, rfcId } = useContext(
    RfcContext
  );

  const track = useAnalyticsHook();

  const classes = useStyles();

  const patch = useMemo(() => queries.endpointsWithSuggestions(), []);

  const endpointsWithChanges = patch.changes.filter((i) =>
    i.status.some((i) => i.isHandled && !i.ignored)
  );

  const allEmpty =
    endpointsWithChanges.length === 0 &&
    patch.added.length === 0 &&
    patch.endpointsToDocument.length === 0;

  const [state, send] = useMachine(
    newApplyChangesMachine(
      patch,
      services,
      services.diffService,
      clientSessionId,
      clientId,
      track
    )
  );

  useEffect(() => {
    console.log('progress updating spec', state);
  }, [state]);

  const isComplete = state.matches('completed');
  useEffect(() => {
    async function saveEvents() {
      const { updatedEvents } = state.context;
      setSummary({
        // oasStats: state.context.oasStats,
        newEndpoints: patch.added.length,
        newEndpointsKnownPaths: patch.endpointsToDocument.length,
        endpointsWithChanges: endpointsWithChanges.length,
      });
      await specService.saveEventsArray(updatedEvents);
      history.push(`${baseUrl}/documentation`);
    }
    if (isComplete) {
      saveEvents();
    }
  }, [isComplete]);

  const start = () => send({ type: 'START' });
  const updateCommitMessage = (message) =>
    send({ type: 'UPDATE_COMMIT_MESSAGE', message });

  return (
    <Dialog
      open={true}
      onClose={() => setAskFinish(false)}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="sm"
      BackdropProps={{
        classes: {
          root: classes.backDrop,
        },
      }}
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
            <Button
              color="secondary"
              disabled={state.value !== 'staged'}
              endIcon={<PlayArrowIcon />}
              variant="contained"
              onClick={start}
            >
              Apply
            </Button>
          </div>
        </Box>

        {state.matches('staged') && (
          <Box style={{ padding: 12, width: '100%' }}>
            <TextField
              multiline
              fullWidth
              label="Describe your changes..."
              value={state.context.commitMessage}
              onChange={(e) => updateCommitMessage(e.target.value)}
            />
            <div style={{ marginTop: 20 }}>
              <RenderPatch patch={patch} />
            </div>
          </Box>
        )}

        {state.matches('generatingNewPaths') ||
          (state.matches('generatingNewBodyCommands') && (
            <GeneratingNewPaths
              endpointIds={state.context.newPaths.endpointIds}
              endpointsToDocument={patch.endpointsToDocument}
              newBodiesProgress={state.context.newBodiesProgress}
              newBodiesProgressLastLearned={
                state.context.newBodiesProgressLastLearned
              }
            />
          ))}

        {(state.matches('runningCommands') || state.matches('completed')) && (
          <UpdatingSpec />
        )}

        {state.matches('failed') && (
          <Typography variant="subtitle2" color="error">
            {state.context.error}
          </Typography>
        )}
      </div>
    </Dialog>
  );
}

function GeneratingNewPaths(props) {
  const {
    endpointIds,
    endpointsToDocument,
    newBodiesProgress,
    newBodiesProgressLastLearned,
  } = props;
  const classes = useStyles();
  const total = endpointIds.length + endpointsToDocument.length;
  return (
    <div className={classes.commonStatus}>
      <Box display="flex" flexDirection="row" alignItems="center">
        <Typography variant="subtitle1" style={{ fontWeight: 400 }}>
          Learning New Endpoints ({newBodiesProgress} / {total})
        </Typography>
        <div style={{ width: 250, marginLeft: 20, marginTop: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(newBodiesProgress / total) * 100}
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

function RenderPatch(props) {
  const { patch } = props;
  const classes = useStyles();
  const { queries, actions } = useDiffSession();

  const withChanges = patch.changes.filter((i) =>
    i.status.some((i) => i.isHandled && !i.ignored)
  );

  const allEmpty =
    withChanges.length === 0 &&
    patch.added.length === 0 &&
    patch.endpointsToDocument.length === 0;

  return (
    <div>
      {allEmpty && (
        <Typography variant="subtitle2" color="secondary">
          No Changes Staged
        </Typography>
      )}
      {patch.added.map((i, index) => {
        return (
          <div className={classes.patchRow} key={'add' + index}>
            <Typography
              variant="body1"
              className={classes.patchTitle}
              style={{ color: AddedGreen }}
            >
              added:{' '}
            </Typography>
            <PathAndMethod method={i.method} path={i.pathExpression} />
          </div>
        );
      })}
      {patch.endpointsToDocument.map((i, index) => {
        return (
          <div className={classes.patchRow} key={'documented' + index}>
            <Typography
              variant="body1"
              className={classes.patchTitle}
              style={{ color: AddedGreen }}
            >
              added:{' '}
            </Typography>
            <PathAndMethod method={i.method} path={i.pathExpression} />
          </div>
        );
      })}
      {withChanges.map(({ method, pathId }, index) => {
        const { httpMethod, fullPath } = queries.getEndpointDescriptor({
          method,
          pathId,
        });
        return (
          <div className={classes.patchRow} key={'changed' + index}>
            <Typography
              variant="body1"
              className={classes.patchTitle}
              style={{ color: ChangedYellow }}
            >
              changed:{' '}
            </Typography>
            <PathAndMethod method={httpMethod} path={fullPath} />
          </div>
        );
      })}
    </div>
  );
}

const PulsingOpticHuge = () => (
  <div className={'blobMedium'} style={{ marginRight: 9 }}>
    <img src="/optic-logo.svg" width={50} height={50} />
  </div>
);

export const StatMini = ({ number, label }) => {
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

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backDrop: {
    backdropFilter: 'blur(2px)',
    backgroundColor: 'rgba(0,0,30,0.4)',
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
  patchRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  patchTitle: {
    fontWeight: 900,
    fontFamily: 'Ubuntu Mono',
    marginRight: 5,
    fontSize: 15,
    marginTop: 2,
  },
  logoWrapper: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const Stat = ({ number, label }) => {
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
