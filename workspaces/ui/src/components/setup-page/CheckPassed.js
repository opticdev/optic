import React, { useState } from 'react';
import {
  Collapse,
  Dialog,
  DialogContent,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Code } from './setup-api/CodeBlock';
import { AddedDarkGreen, AddedGreen, AddedGreenBackground } from '../../theme';
import { useLatestEvent } from './setup-api/useUserTracking';
import { ApiCheckCompleted } from '@useoptic/analytics/lib/events/onboarding';
import { useRecursiveTimeout } from './setup-api/useCaptureSampleCounter';
import { useServices } from '../../contexts/SpecServiceContext';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { Link } from 'react-router-dom';
import { useBaseUrl } from '../../contexts/BaseUrlContext';
import ScrollIntoViewIfNeeded from 'react-scroll-into-view-if-needed';

export function CheckPassed(props) {
  const classes = useStyles();
  const { events } = props;
  const [started, setStarted] = useState();
  const { specService } = useServices();
  const [count, setCounter] = useState(0);
  const baseUrl = useBaseUrl();

  useLatestEvent((latest) => {
    console.log(latest);
    if (latest.type === 'StartedTaskWithLocalCli') {
      setStarted(latest.data);
    }
    if (latest.type === 'ExitedTaskWithLocalCli') {
      setStarted(undefined);
      setCounter(0);
    }
  }, events);

  useRecursiveTimeout(async () => {
    if (started) {
      try {
        const status = await specService.getCaptureStatus(started.captureId);
        setCounter(status.interactionsCount);
      } catch (e) {}
    }
  }, 1500);

  const target = 5;
  const percentComplete = (count / target) * 100;

  return (
    <Collapse in={props.passed} style={{ marginBottom: 300 }}>
      <Divider style={{ marginTop: 40, marginBottom: 20 }} />
      <div className={classes.root}>
        {props.passed && (
          <ScrollIntoViewIfNeeded>
            <Typography variant="h5" style={{ marginBottom: 18 }}>
              ✅ Check Passed! Your <Code>api start</Code> command is all set
              up.
            </Typography>
          </ScrollIntoViewIfNeeded>
        )}
        <Typography variant="h6" className={classes.copy}>
          Now run <Code>api start</Code>
        </Typography>

        {started ? (
          <>
            <Typography variant="h6" style={{ marginTop: 10 }}>
              Your API is running with Optic on{' '}
              <Code>
                {started.inputs['proxyConfig.protocol']}
                {'//'}
                {started.inputs['proxyConfig.host']}
                {':'}
                {started.inputs['proxyConfig.port']}
              </Code>
            </Typography>
            <Typography
              variant="body1"
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              Send at least {target} requests to your API using, curl, Postman,
              your webapp, etc
            </Typography>

            <ScrollIntoViewIfNeeded>
              <LinearProgress
                style={{ marginTop: 20 }}
                variant="determinate"
                value={percentComplete < 100 ? percentComplete : 100}
              />
            </ScrollIntoViewIfNeeded>
            <Typography
              variant="h6"
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              {count}/{target} requests sent
            </Typography>
            {count && count >= target ? (
              <>
                <Typography variant="h5" style={{ marginTop: 20 }}>
                  ✅ Awesome work! Let's document those endpoints!
                </Typography>
                <Button
                  variant="contained"
                  size="medium"
                  component={Link}
                  color="primary"
                  to={baseUrl + '/review'}
                  style={{ marginTop: 20 }}
                >
                  Start Documenting
                </Button>
              </>
            ) : null}
          </>
        ) : (
          <Typography
            variant="subtitle1"
            style={{ marginTop: 10, opacity: 0.5 }}
          >
            Waiting for your API to start...{started && JSON.stringify(started)}
          </Typography>
        )}
      </div>
    </Collapse>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 640,
    paddingTop: 22,
  },
  copy: {
    fontWeight: 200,
    marginBottom: 13,
  },
}));
