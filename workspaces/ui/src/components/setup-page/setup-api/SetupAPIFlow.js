import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Divider, Typography } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import makeStyles from '@material-ui/core/styles/makeStyles';
import shellEscape from 'shell-escape';
import Button from '@material-ui/core/Button';
import Helmet from 'react-helmet';
import { useLatestEvent, useUserTracking } from './useUserTracking';
import { SetupType } from './SetupType';
import {
  CHANGED_HOSTNAME,
  CHANGED_START_COMMAND,
  CHANGED_TARGET_URL,
  DocumentAPIFlowEvents,
  EMPTY_SEARCH_RESULTS,
  FRAMEWORK_SELECTED,
  MARK_API_AS_INITIALIZED,
  MODE_SELECTED,
  MODES,
  READY_TO_SEE_COMMAND,
  SET_STEP_TO,
} from './events';
import Fade from '@material-ui/core/Fade';
import { StartCommandInput } from './StartCommandInput';
import { AddressBarInput } from './AddressBarInput';
import Paper from '@material-ui/core/Paper';
import { BatteryUnknown } from '@material-ui/icons';
import { Link } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import { ApiCheckCompleted } from '@useoptic/analytics/lib/events/onboarding';
import { CheckHelp } from './CheckHelp';
import { StartedTaskWithLocalCli } from '@useoptic/analytics/lib/events/tasks';
import { RequestCounter } from './RequestCounter';
import { useCaptureSampleCounter } from './useCaptureSampleCounter';

import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Accordion from '@material-ui/core/Accordion';
import { NextButton } from './NextButton';
import { Code, CodeBlock } from './CodeBlock';
import { GuidedFlow } from './GuidedFlow';
import {
  MarkdownRender,
  setupText,
  setupTextHeader,
} from '../fetch-docs/BuildMD';
import { integrationDocsOptions } from '../fetch-docs/IntegrationDocs';
import FrameworkSelect from './FrameworkSelect';
import {
  AddedGreen,
  ChangedYellow,
  ChangedYellowBackground,
  RemovedRed,
  SubtleBlueBackground,
  UpdatedBlue,
} from '../../../theme';
import { WaitingForSpinner } from './WaitingForSpinner';
import { GuidedFlowContext, useGuidedFlow } from './base';
import { documentAPISteps } from './steps';

const tempdocslink = 'https://docs.useoptic.com/getting-started/setup';

const useStyles = makeStyles((theme) => ({
  documentCard: {
    marginTop: 14,
    padding: 9,
    backgroundColor: SubtleBlueBackground,
    borderLeft: `3px solid ${UpdatedBlue}`,
    borderBottomLeftRadius: 2,
    borderTopLeftRadius: 2,
  },
  top: {
    top: 0,
    position: 'absolute',
    width: '100%',
  },
  heading: {
    fontWeight: 700,
    paddingBottom: 10,
  },
  body: {
    fontWeight: 300,
    marginBottom: 12,
  },
  question: {
    fontWeight: 200,
    fontSize: 20,
    fontFamily: 'Ubuntu Mono',
    marginBottom: 12,
  },
  codeChangeCard: {
    backgroundColor: ChangedYellowBackground,
    paddingLeft: 6,
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 16,
    borderLeft: `3px solid ${ChangedYellow}`,
  },
}));

export function SetupAPIFlow(props) {
  const classes = useStyles();

  const { events, daemonIsUp } = useUserTracking();

  const guidedFlow = useGuidedFlow(
    documentAPISteps,
    {
      currentStep: 0,
      mode: MODES.RECOMMENDED,
      startOnHostname: 'http://localhost:3500',
      targetUrl: '',
      startCommand: '',
    },
    (internalState, newEvent) => {
      switch (newEvent.type) {
        case DocumentAPIFlowEvents.MODE_SELECTED:
          internalState.mode = newEvent.mode;
          return internalState;
          break;
        case DocumentAPIFlowEvents.SET_STEP_TO:
          internalState.currentStep = newEvent.to;
          return internalState;
          break;
        case DocumentAPIFlowEvents.FRAMEWORK_SELECTED:
          internalState.framework = newEvent.framework;
          return internalState;
          break;
        case DocumentAPIFlowEvents.EMPTY_SEARCH_RESULTS:
          internalState.emptySearch = true;
          return internalState;
          break;
        case DocumentAPIFlowEvents.READY_TO_SEE_COMMAND:
          internalState.showCommand = true;
          return internalState;
          break;
        case DocumentAPIFlowEvents.CHANGED_START_COMMAND:
          internalState.startCommand = newEvent.command;
          return internalState;
          break;
        case DocumentAPIFlowEvents.CHANGED_TARGET_URL:
          internalState.targetUrl = newEvent.targetUrl;
          return internalState;
          break;
        case DocumentAPIFlowEvents.CHANGED_HOSTNAME:
          internalState.startOnHostname = newEvent.hostname;
          return internalState;
          break;
        case DocumentAPIFlowEvents.MARK_API_AS_INITIALIZED:
          internalState.initializedAtPath = newEvent.cwd;
          return internalState;
          break;
      }
    },
    (internalState, dispatch) => {
      return (
        <div style={{ position: 'relative' }}>
          <Step0 show={internalState.currentStep === 0} />
          <Step1 show={internalState.currentStep === 1} events={events} />
          <Step2 show={internalState.currentStep === 2} events={events} />
          <Step3 show={internalState.currentStep === 3} events={events} />
        </div>
      );
    }
  );

  return (
    <>
      <Helmet title="Setup Optic" />

      <GuidedFlow
        objective="Document your API"
        toc={guidedFlow.tocSteps}
        currentStep={guidedFlow.currentStep}
      >
        {daemonIsUp === true && guidedFlow.centerContent}
      </GuidedFlow>
    </>
  );
}

function Step0(props) {
  const classes = useStyles();
  const { dispatch, state } = useContext(GuidedFlowContext);
  const { mode } = state;
  return (
    <Fade in={props.show} className={classes.top}>
      <div>
        <Typography variant="h5" className={classes.heading}>
          Add Optic to your API Project
        </Typography>
        <Typography variant="body1" className={classes.body}>
          Optic learns your API's contract by monitoring its traffic as you
          develop. The easiest way to get started with Optic is to add it to
          your local development environment:
        </Typography>
        <Typography variant="body1" className={classes.body}>
          We recommend creating an <Code>api start</Code> command for your
          project:
        </Typography>

        <SetupType
          value={mode}
          onChoose={(choice) => dispatch(MODE_SELECTED(choice))}
        />

        {mode && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <NextButton
              key="mode-picked"
              onClick={() => dispatch(SET_STEP_TO(1))}
            >
              Next Step: Initializing Optic in your Project
            </NextButton>
          </div>
        )}
      </div>
    </Fade>
  );
}

function Step1(props) {
  const classes = useStyles();
  const { events } = props;

  const { dispatch, state } = useContext(GuidedFlowContext);

  // useLatestEvent((latest) => {
  //   if (latest.type === 'ApiInitializedInProject') {
  //     dispatch(MARK_API_AS_INITIALIZED(latest.data.cwd, latest.data.apiName));
  //   }
  // }, events);

  const {
    framework,
    emptySearch,
    showCommand,
    startCommand,
    startOnHostname,
    targetUrl,
    mode,
    initializedAtPath,
  } = state;

  const { data } =
    integrationDocsOptions.find((i) => i.value === framework) || {};

  const manualMode = (
    <>
      <Collapse in={!showCommand}>
        <Typography variant="h5" className={classes.heading}>
          Setup the Optic Proxy
        </Typography>
        <Typography variant="body1" className={classes.body}>
          Optic can proxy your traffic to local and remote services. While
          handling your traffic, it can document + verify the behavior of the
          service it is connected to.
        </Typography>

        <div style={{ marginBottom: 20 }}>
          <Typography variant="subtitle1" className={classes.question}>
            I want to proxy traffic to:
          </Typography>
          <AddressBarInput
            placeholder={'https://api.example.com'}
            value={targetUrl}
            autoFocus
            onChange={(value) => {
              dispatch(CHANGED_TARGET_URL(value));
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <Typography variant="subtitle1" className={classes.question}>
            With the Optic proxy running here (should be{' '}
            <Code>localhost:xxxx</Code>
            ):
          </Typography>
          <AddressBarInput
            placeholder="I want the Optic proxy to run here: "
            value={startOnHostname}
            onChange={(value) => {
              dispatch(CHANGED_HOSTNAME(value));
            }}
          />
        </div>

        <Button
          variant="contained"
          size="medium"
          color="primary"
          style={{ marginTop: 22 }}
          disabled={!targetUrl}
          onClick={() => dispatch(READY_TO_SEE_COMMAND())}
        >
          Check Optic Proxy Configuration
        </Button>
      </Collapse>
    </>
  );
  const recommendedMode = (
    <>
      <Collapse in={!showCommand}>
        <Typography variant="h5" className={classes.heading}>
          Tell Optic how to Start your API
        </Typography>
        <Typography variant="body1" className={classes.body}>
          Optic can learn your API's contract by monitoring any kinds of
          traffic. The easiest way to get started with Optic is to add it to
          your local development environment.
        </Typography>
      </Collapse>
      <Collapse in={!showCommand}>
        <div style={{ marginBottom: 10 }}>
          <FrameworkSelect
            value={framework}
            touchEmpty={() => dispatch(EMPTY_SEARCH_RESULTS())}
            onChoose={(framework) => dispatch(FRAMEWORK_SELECTED(framework))}
            setStartCommand={(value) => dispatch(CHANGED_START_COMMAND(value))} // set to default command if provided
          />
        </div>
      </Collapse>

      <Collapse in={(framework || emptySearch) && !showCommand}>
        <div style={{ marginTop: framework ? 0 : 65 }}>
          <div style={{ marginBottom: 20 }}>
            <Typography variant="subtitle1" className={classes.question}>
              I start my API using this command:
            </Typography>
            <StartCommandInput
              placeholder={data && data.start_command}
              value={startCommand}
              onChange={(value) => dispatch(CHANGED_START_COMMAND(value))}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <Typography variant="subtitle1" className={classes.question}>
              When I run that command, I expect my API to start on:
            </Typography>
            <AddressBarInput
              placeholder="Hostname where your API listens"
              value={startOnHostname}
              onChange={(value) => {
                dispatch(CHANGED_HOSTNAME(value));
              }}
            />
          </div>

          {data && data.code_change && (
            <div style={{ marginBottom: 25 }}>
              <Accordion elevation={1} className={classes.codeChangeCard}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <MarkdownRender source={setupTextHeader()} />
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="textSecondary">
                    <MarkdownRender source={setupText(data)} />
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          )}

          <Button
            variant="contained"
            size="medium"
            color="primary"
            disabled={!startCommand}
            onClick={() => dispatch(READY_TO_SEE_COMMAND())}
          >
            Check Start Command
          </Button>
        </div>
      </Collapse>
    </>
  );

  const initConfig =
    mode === MODES.RECOMMENDED
      ? [
          '--inboundUrl',
          startOnHostname.trim(),
          '--command',
          startCommand.trim(),
        ]
      : [
          '--inboundUrl',
          startOnHostname.trim(),
          '--targetUrl',
          targetUrl.trim(),
        ];

  return (
    <Fade in={props.show} className={classes.top}>
      <div style={{ marginBottom: 120 }}>
        {mode === MODES.RECOMMENDED && recommendedMode}
        {mode === MODES.MANUAL && manualMode}

        <Collapse in={showCommand}>
          <div style={{ marginBottom: 20 }}>
            <Typography variant="h5" className={classes.heading}>
              Initialize Optic with this Configuration
            </Typography>
            <Typography variant="body1" className={classes.body}>
              1. Open a Shell
            </Typography>

            <Paper
              elevation={2}
              component="div"
              style={{
                width: 153,
                height: 97,
                overflow: 'hidden',
                marginBottom: 27,
              }}
            >
              <img
                src={require('../../../assets/open-terminal.svg')}
                width={153}
              />
            </Paper>

            <Typography variant="body1" className={classes.body}>
              2. Set your working directory to your project's root
            </Typography>

            <CodeBlock
              lang="bash"
              code="cd path/to/api"
              style={{ marginBottom: 12 }}
            />

            <Typography variant="body1" className={classes.body}>
              3. Run this <Code>api init</Code> command
            </Typography>

            <CodeBlock
              lang="bash"
              style={{ marginBottom: 12 }}
              code={shellEscape(['api', 'init', ...initConfig])}
            />

            <WaitingForSpinner
              label={'you to run init'}
              done={Boolean(initializedAtPath)}
              doneMessage="Optic has been added to your API. Time to check if it works!"
            />
            {initializedAtPath && (
              <NextButton
                key="go-to-check"
                onClick={() => dispatch(SET_STEP_TO(2))}
                auto
                disabled={!initializedAtPath}
              >
                Last Step: Check your API Setup
              </NextButton>
            )}
          </div>
        </Collapse>
      </div>
    </Fade>
  );
}

function Step2(props) {
  const classes = useStyles();
  const { dispatch, state } = useContext(GuidedFlowContext);
  const { mode } = state;
  const { events } = props;

  const [lastRun, setLastRun] = useState(null);

  useLatestEvent((latest) => {
    if (latest.type === ApiCheckCompleted.eventName) {
      setLastRun({
        results: latest.data,
        timestamp: latest.context.clientTimestamp,
      });
    }
  }, events);

  return (
    <Fade in={props.show} className={classes.top}>
      <div>
        <Typography variant="h5" className={classes.heading}>
          Almost Done! Check your Setup
        </Typography>
        <Typography variant="body1" className={classes.body}>
          Use the <Code>api check</Code> command to confirm that your Optic
          integration is working!
        </Typography>

        <CodeBlock
          lang="bash"
          code={
            mode === MODES.RECOMMENDED
              ? 'api check start'
              : 'api check start-proxy'
          }
          style={{ marginBottom: 18 }}
        />

        <WaitingForSpinner
          done={Boolean(lastRun)}
          doneMessage={
            lastRun && lastRun.results.passed
              ? 'Check Passed! Nice work!'
              : 'Check Failed. Make these changes and try again.'
          }
          doneIcon={
            lastRun && lastRun.results.passed ? (
              <DoneIcon style={{ color: AddedGreen, marginRight: 9 }} />
            ) : (
              <WarningIcon style={{ color: RemovedRed, marginRight: 9 }} />
            )
          }
          label="you to run the check command"
        />

        <CheckHelp results={lastRun && lastRun.results} />

        {lastRun && lastRun.results.passed && (
          <NextButton
            key={'finish-check-button'}
            auto={true}
            disabled={!lastRun && lastRun.results.passed}
            onClick={() => dispatch(SET_STEP_TO(3))}
          >
            All Setup! Start Documenting your API
          </NextButton>
        )}
      </div>
    </Fade>
  );
}

function Step3(props) {
  const classes = useStyles();
  const { dispatch, state } = useContext(GuidedFlowContext);
  const { mode } = state;
  const { events } = props;

  const [lastStart, setStart] = useState(null);

  useLatestEvent((latest) => {
    if (latest.type === StartedTaskWithLocalCli.eventName) {
      setStart({
        config: latest.data,
        timestamp: latest.context.clientTimestamp,
      });
    }
  }, events);

  const proxyRunningOn =
    lastStart &&
    (() => {
      const inputs = lastStart.config.inputs;
      const host = inputs['proxyConfig.host'];
      const port = inputs['proxyConfig.port'];
      const basePath = inputs['proxyConfig.basePath'];
      return `http://${host}:${port}${basePath}`;
    })();

  const { count, diffReviewUrl } = useCaptureSampleCounter(
    lastStart && lastStart.config.cwd,
    lastStart && lastStart.config.captureId
  );
  const target = 5;

  useEffect(() => {
    // trackUserEvent(ImplEventTypes.OnboardingSamplesCollected, { count });
  }, [count]);

  return (
    <Fade in={props.show} className={classes.top}>
      <div>
        <Typography variant="h5" className={classes.heading}>
          Run{' '}
          <Code>
            {mode === MODES.RECOMMENDED ? 'api start' : 'api run start-proxy'}
          </Code>{' '}
          and send traffic!
        </Typography>
        <Typography variant="body1" className={classes.body}>
          This is it! It's time to send traffic to your API that Optic can learn
          from. From now on, you should start your API with Optic so it can
          monitor your API's behavior.{' '}
          <b style={{ fontWeight: 400 }}>
            Note: All data is stored and processed locally
          </b>
        </Typography>

        <CodeBlock
          lang="bash"
          code={
            mode === MODES.RECOMMENDED ? 'api start' : 'api run start-proxy'
          }
          style={{ marginBottom: 18 }}
        />

        <WaitingForSpinner
          done={Boolean(lastStart)}
          doneMessage={'API Started! Nice work!'}
          label="you to start your API with Optic"
        />

        <Collapse in={Boolean(lastStart)}>
          <div style={{ marginTop: 33 }}>
            <Typography variant="h5">
              Your API is running on <Code>{proxyRunningOn}</Code>
            </Typography>
            <Typography
              variant="body1"
              className={classes.body}
              style={{ marginTop: 11 }}
            >
              Send traffic to your API using your App, tests, Postman, Curl, or
              any other traffic source you use when developing.
            </Typography>

            <RequestCounter target={target} value={count} />
            <WaitingForSpinner
              done={count >= target}
              doneMessage={'Nice work! Time to document some endpoints'}
              label={`traffic. ${count}/${target} requests observed `}
            />

            <NextButton
              key={'final-button'}
              disabled={!(count >= target)}
              auto={true}
              onClick={() => {
                // trackUserEvent(ImplEventTypes.OnboardingCompleted, {});
              }}
              href={diffReviewUrl}
            >
              Document your First Endpoints in Optic
            </NextButton>
          </div>
        </Collapse>
      </div>
    </Fade>
  );
}
