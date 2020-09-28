import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
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
import { LearnPaths } from './Learn';
import { RfcContext } from '../../../../contexts/RfcContext';
import { lengthScala } from '@useoptic/domain';
import { useCaptureContext } from '../../../../contexts/CaptureContext';

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

export default function InProgressFullScreen(props) {
  const { currentPathExpressions } = useContext(LearnAPIPageContext);
  const { endpointDiffs, completed } = useCaptureContext();
  const { eventStore, handleCommands, rfcId } = useContext(RfcContext);
  const classes = useStyles();

  const [createdPaths, setCreatedPaths] = useState(false);
  const [collectingDiffsStatus, setCollectingDiffsStatus] = useState('running');

  //Runs First
  useEffect(() => {
    //build the paths
    const commands = LearnPaths(eventStore, rfcId, currentPathExpressions);
    setCreatedPaths(true);
    setTimeout(() => handleCommands(...commands), 100);
  }, [currentPathExpressions.length]);

  //Runs when the # of events changes
  useEffect(() => {
    if (createdPaths) {
      setCollectingDiffsStatus('running');
    }
    if (createdPaths && completed) {
      setCollectingDiffsStatus('done');
      // wait for diffs
    }
  }, [lengthScala(eventStore.listEvents(rfcId)), completed]);

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
            Learning {currentPathExpressions.length} endpoint
            {currentPathExpressions.length !== 1 && 's'}...
          </Typography>
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

          <List dense>
            <Step
              title={'Adding paths to spec...'}
              started={true}
              done={createdPaths}
            />
            <Step
              title={'Collecting examples...'}
              started={
                collectingDiffsStatus === 'done' ||
                collectingDiffsStatus === 'running'
              }
              done={collectingDiffsStatus === 'done'}
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
              value={20}
              style={{ marginTop: 5 }}
            />
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
