import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import uuidv4 from 'uuid/v4';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { Container } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import {
  Dark,
  DocDarkGrey,
  DocDivider,
  DocGrey,
} from '../../../docs/DocConstants';
import { LearnAPIPageContext } from './LearnAPIPageContext';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import DoneIcon from '@material-ui/icons/Done';
import CircularProgress from '@material-ui/core/CircularProgress';
import { AddedGreen } from '../../../../theme';
import LinearProgress from '@material-ui/core/LinearProgress';
import { getSamplesToLearnFrom, LearnPaths } from './Learn';
import { RfcContext } from '../../../../contexts/RfcContext';
import {
  Facade,
  lengthScala,
  mapScala,
  OasProjectionHelper,
  opticEngine,
  RfcCommandContext,
} from '@useoptic/domain';
import { useCaptureContext } from '../../../../contexts/CaptureContext';
import { DiffContext } from '../DiffContext';
import { flatten } from '../DiffPageNew';
import { withSpecContext } from '../Finalize';
import { useServices } from '../../../../contexts/SpecServiceContext';
import { useHistory } from 'react-router-dom';
import { useBaseUrl } from '../../../../contexts/BaseUrlContext';
import Collapse from '@material-ui/core/Collapse';
import { Stat, subtabs } from '../CaptureManagerPage';

const { JsonHelper } = opticEngine.com.useoptic;
const jsonHelper = JsonHelper();

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  container: {
    marginTop: '20%',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function InProgressFullScreen({ type }) {
  const isManual = type === 'manual';
  const { currentPathExpressions, reset } = useContext(LearnAPIPageContext);

  const history = useHistory();
  const {
    endpointDiffs,
    completed,
    captureService,
    diffService,
    captureId,
    additionalCommands,
    updatedAdditionalCommands,
  } = useCaptureContext();
  const { eventStore, rfcId, clientSessionId, clientId } = useContext(
    RfcContext
  );
  const { specService } = useServices();
  const classes = useStyles();
  const baseUrl = useBaseUrl();

  const [endpointIds, setEndpointIds] = useState(undefined);
  const [stats, setStats] = useState(undefined);
  const [collectingDiffsStatus, setCollectingDiffsStatus] = useState('running');
  const [progressTicker, setProgressTicker] = useState(0);
  const [done, setDone] = useState(0);

  //Runs First
  useEffect(() => {
    //build the paths
    const { commands, endpointIds } = LearnPaths(
      eventStore,
      rfcId,
      currentPathExpressions
    );
    setEndpointIds(endpointIds);
    setTimeout(() => {
      updatedAdditionalCommands(commands);
    }, 100);
  }, [currentPathExpressions.length]);

  //Runs when the # of events changes
  useEffect(() => {
    if (endpointIds) {
      setCollectingDiffsStatus('running');
    }

    if (endpointIds && completed && !done && additionalCommands.length) {
      if (isManual) {
        const learnManual = async () => {
          const batchCommands = [...additionalCommands];

          const commandsAsVector = jsonHelper.jsArrayToVector(batchCommands);

          const asJs = opticEngine.CommandSerialization.toJs(commandsAsVector);

          const newEventStore = eventStore.getCopy(rfcId);
          const {
            StartBatchCommit,
            EndBatchCommit,
          } = opticEngine.com.useoptic.contexts.rfc.Commands;
          const batchId = uuidv4();
          const commandContext = new RfcCommandContext(
            clientId,
            clientSessionId,
            batchId
          );

          Facade.fromCommands(
            newEventStore,
            rfcId,
            commandsAsVector,
            commandContext
          );

          setStats({
            fields: 0,
            requests: 0,
            responses: 0,
            oasLineCount: 0,
          });
          updatedAdditionalCommands([]); // clear these
          await specService.saveEvents(newEventStore, rfcId);
          setDone(true);
        };

        learnManual();
      } else {
        getSamplesToLearnFrom(
          eventStore,
          rfcId,
          endpointIds,
          endpointDiffs,
          captureService,
          diffService,
          async (suggestions) => {
            const commands = [];
            suggestions.forEach((x) =>
              mapScala(x.commands)((command) => commands.push(command))
            );

            const newEventStore = eventStore.getCopy(rfcId);
            const {
              StartBatchCommit,
              EndBatchCommit,
            } = opticEngine.com.useoptic.contexts.rfc.Commands;
            const batchId = uuidv4();
            const commandContext = new RfcCommandContext(
              clientId,
              clientSessionId,
              batchId
            );

            const pathAddCommands = additionalCommands;
            const batchCommands = [...pathAddCommands, ...commands];

            const commandsAsVector = jsonHelper.jsArrayToVector(batchCommands);

            const asJs = opticEngine.CommandSerialization.toJs(
              commandsAsVector
            );

            Facade.fromCommands(
              newEventStore,
              rfcId,
              commandsAsVector,
              commandContext
            );

            updatedAdditionalCommands([]); // clear these
            const oas = OasProjectionHelper.fromEventString(
              newEventStore.serializeEvents(rfcId)
            );

            setStats({
              fields: asJs.reduce(
                (sum, command) => (command.AddField ? sum + 1 : sum),
                0
              ),
              requests: asJs.reduce(
                (sum, command) => (command.AddRequest ? sum + 1 : sum),
                0
              ),
              responses: asJs.reduce(
                (sum, command) =>
                  command.AddResponseByPathAndMethod ? sum + 1 : sum,
                0
              ),
              oasLineCount: JSON.stringify(oas, null, 4).split('\n').length,
            });
            await specService.saveEvents(newEventStore, rfcId);
            setDone(true);
          },
          setProgressTicker
        );
      }
    }
  }, [completed]);

  const Step = ({ title, done, started }) => {
    if (!started) {
      return null;
    }
    return (
      <ListItem dense>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            style: {
              color: Dark,
              fontWeight: 100,
            },
          }}
        />
        <ListItemSecondaryAction>
          {done ? (
            <DoneIcon style={{ color: AddedGreen, height: 15, marginTop: 7 }} />
          ) : (
            <div style={{ marginLeft: -16 }}>
              <CircularProgress size={10} color="secondary" />
            </div>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  return (
    <Dialog fullScreen open={true} TransitionComponent={Transition}>
      <Container maxWidth="sm" className={classes.container}>
        <Paper className={classes.paper} elevation={4}>
          <PulsingOpticHuge />
          <Typography color="primary" variant="h5">
            {done ? (
              <>
                Documented {currentPathExpressions.length} endpoint
                {currentPathExpressions.length !== 1 && 's'}
              </>
            ) : (
              <>
                Learning {currentPathExpressions.length} endpoint
                {currentPathExpressions.length !== 1 && 's'}...
              </>
            )}
          </Typography>
          {!done && (
            <Typography
              variant="caption"
              style={{
                fontSize: 11,
                color: DocDarkGrey,
                textTransform: 'uppercase',
              }}
            >
              This may take a minute
            </Typography>
          )}

          <List dense>
            <Collapse in={!done}>
              <div>
                <Step
                  title={'Adding paths to spec...'}
                  started={true}
                  done={Boolean(endpointIds)}
                />
                <Step
                  title={'Collecting examples...'}
                  started={
                    collectingDiffsStatus === 'done' ||
                    collectingDiffsStatus === 'running'
                  }
                  done={collectingDiffsStatus === 'done' || done}
                />

                <ListItem dense>
                  <ListItemText
                    primary="Learning Endpoints..."
                    primaryTypographyProps={{
                      style: {
                        color: Dark,
                        fontWeight: 100,
                      },
                    }}
                  />
                </ListItem>
                <LinearProgress
                  variant="determinate"
                  value={(progressTicker / currentPathExpressions.length) * 100}
                  style={{ marginTop: 5 }}
                />
              </div>
            </Collapse>
            <Collapse in={done}>
              <div style={{ textAlign: 'center', marginTop: 19 }}>
                {stats && !isManual ? (
                  <Typography variant="body1" color="primary">
                    <Typography variant="h6" color="textPrimary">
                      That's <Stat number={stats.oasLineCount} label="line" />{' '}
                      of OpenAPI that Optic will continue to keep up-to-date for
                      your team!
                    </Typography>

                    <div
                      style={{
                        display: 'flex',
                        margin: '0 auto',
                        justifyContent: 'space-around',
                        maxWidth: 320,
                      }}
                    >
                      <StatMini number={stats.requests} label="new request" />
                      <StatMini number={stats.responses} label="new response" />
                      <StatMini number={stats.fields} label="new field" />
                    </div>
                    <div></div>
                    <div></div>
                  </Typography>
                ) : null}
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  style={{ marginTop: 30 }}
                  onClick={() => {
                    if (isManual) {
                      reset();
                      history.push(
                        `${baseUrl}/diffs/${captureId}?tab=${subtabs.ENDPOINT_DIFF}`
                      );
                    } else {
                      history.push(`${baseUrl}/documentation`);
                    }
                  }}
                >
                  {isManual ? 'Document Bodies' : 'Review Documentation'}
                </Button>
              </div>
            </Collapse>
          </List>
        </Paper>
      </Container>
    </Dialog>
  );
}

const PulsingOpticHuge = () => (
  <div className={'blobBig'} style={{ marginRight: 9 }}>
    <img src="/optic-logo.svg" width={72} height={72} />
  </div>
);

const StatMini = ({ number, label }) => {
  return (
    <span>
      {number !== 0 && (
        <Typography
          variant="caption"
          component="span"
          color="secondary"
          style={{ fontWeight: 800 }}
        >
          {number}{' '}
        </Typography>
      )}
      <Typography
        variant="caption"
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
