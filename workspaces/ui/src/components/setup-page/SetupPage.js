import React, { useEffect, useMemo, useState } from 'react';
import Page from '../Page';
import { makeStyles } from '@material-ui/core/styles';
import { useMachine } from '@xstate/react';
import { newSetupAndCheckMachine } from './setup-and-check-machine';
import { useServices } from '../../contexts/SpecServiceContext';
import { ShowCurrentOpticYml } from './yaml/UpdateOpticYml';
import { HelperCard } from './HelperCard';
import { FrameworkHelper } from './FrameworkHelper';
import { useLatestEvent, useUserTracking } from './setup-api/useUserTracking';
import { ApiCheckCompleted } from '@useoptic/analytics/lib/events/onboarding';
import Box from '@material-ui/core/Box';
import { useDebounce } from './useDebounceHook';
import HelpIcon from '@material-ui/icons/Help';
import {
  Collapse,
  IconButton,
  Paper,
  Typography,
  Zoom,
} from '@material-ui/core';
import { Code } from './setup-api/CodeBlock';
import {
  OpticBlue, primary,
  SubtleBlueBackground,
  UpdatedBlue,
  UpdatedBlueBackground,
} from '../../theme';
import { CheckPassed } from './CheckPassed';
import { MarkdownRender } from './fetch-docs/BuildMD';
import { DemoStartCommandSetup } from './setup-api/SetupType';
import { LightTooltip } from '../tooltips/LightTooltip';
import { integrationDocsOptions } from './fetch-docs/IntegrationDocs';

export function SetupPage(props) {
  const classes = useStyles();
  const { events, daemonIsUp } = useUserTracking();

  const focusTask = 'start';
  const { specService } = useServices();
  const [state, send] = useMachine(
    newSetupAndCheckMachine(focusTask, specService)
  );

  useLatestEvent((latest) => {
    if (latest.type === ApiCheckCompleted.eventName) {
      send({ type: 'CHECK_RESULT_RECEIVED', result: latest.data });
    }
  }, events);

  const {
    stagedRanges,
    stagedConfig,
    mode,
    framework,
    lastCheckResult,
    lastKnownSavedConfig,
    checkCount,
  } = state.context;

  const noChecks = !Boolean(lastCheckResult);

  const debouncedConfigRaw = useDebounce(stagedConfig, 1500);
  const hasChanges = lastKnownSavedConfig !== stagedConfig;
  const isSaving = state.matches('saving');

  useEffect(() => {
    if (debouncedConfigRaw && hasChanges) {
      send({ type: 'USER_FINISHED_CHANGING_CONFIG' });
    }
  }, [debouncedConfigRaw]);

  function helperCardFor(setting) {
    return (
      <HelperCard
        key={setting}
        mode={mode}
        noChecks={noChecks}
        result={lastCheckResult}
        setting={setting}
        value={stagedRanges.task && stagedRanges.task[setting]}
      />
    );
  }

  const cards =
    mode === 'recommended'
      ? [helperCardFor('command'), helperCardFor('inboundUrl')]
      : [helperCardFor('targetUrl'), helperCardFor('inboundUrl')];

  return (
    <Page title="Setup your API Start task">
      <Page.Navbar mini={true} />
      <Page.Body padded={true} className={classes.pageBg} style={{overflowY:"scroll"}}>
        <Box display="flex" className={classes.copyRoot}>
          <ApiStartCommandCopy />
        </Box>
        <Box display="flex" className={classes.root}>
          {!state.matches('loading') && (
            <>
              <div style={{ minWidth: 600, flex: 1 }}>
                <ShowCurrentOpticYml
                  saving={isSaving}
                  hasChanges={hasChanges}
                  focusTask={focusTask}
                  rawConfig={stagedConfig}
                  result={lastCheckResult}
                  ranges={stagedRanges}
                  updateValue={(contents) =>
                    send({ type: 'USER_UPDATED_CONFIG', contents })
                  }
                />

                <PortAssumption
                  style={{ marginTop: 24 }}
                  framework={framework}
                />

                <PromptCheck
                  hasChanges={hasChanges}
                  stagedConfig={stagedConfig}
                  lastResult={lastCheckResult}
                  checkCount={checkCount}
                  focusTask={focusTask}
                  command={stagedRanges.task && stagedRanges.task.command}
                />

                <CheckPassed
                  passed={lastCheckResult && lastCheckResult.passed}
                  events={events}
                />
              </div>
              <div style={{ paddingLeft: 20, width: 325 }}>
                <FrameworkHelper
                  mode={mode}
                  framework={framework}
                  onChooseFramework={(framework) => {
                    send({ type: 'USER_SELECTED_FRAMEWORK', framework });
                  }}
                  onModeChange={(mode) =>
                    send({ type: 'USER_TOGGLED_MODE', mode })
                  }
                />
                <div style={{ marginTop: 20 }}>{cards}

                <a href="https://discord.gg/t9hADkuYjP" target="_blank" style={{color: primary}}>
                <Typography variant="subtitle2" style={{marginTop: 15}}>Need Help? Join us on Discord</Typography>
                </a>
                </div>
              </div>
            </>
          )}
        </Box>
      </Page.Body>
    </Page>
  );
}

function PromptCheck({
  hasChanges,
  lastResult,
  stagedConfig,
  checkCount,
  focusTask,
}) {
  const classes = useStyles();
  const passed = lastResult && lastResult.passed;
  const shouldShow =
    !lastResult || (lastResult && lastResult.rawConfig !== stagedConfig);

  return (
    <>
      {!passed && (
        <Typography variant="subtitle1" style={{ marginTop: 18, opacity: 0.5 }}>
          Waiting for Checks to Pass...
        </Typography>
      )}
      <Collapse in={!passed}>
        <Paper
          className={classes.promptCheck}
          style={{ opacity: shouldShow ? 1 : 0.5 }}
        >
          <Typography
            variant="caption"
            style={{ color: SubtleBlueBackground, marginRight: 15 }}
          >
            {checkCount > 0
              ? 'Run the check again to see if your changes worked:'
              : 'Check if your alias works by running this command in the terminal:'}
          </Typography>
          <Code style={{ color: 'white', fontSize: 18 }}>
            api check {focusTask}
          </Code>
        </Paper>
      </Collapse>
    </>
  );
}

function ApiStartCommandCopy(props) {
  const classes = useStyles();

  return (
    <div style={{ maxWidth: 670 }}>
      <Typography variant="h4" style={{ marginBottom: 18 }}>
        Start your API with Optic:
      </Typography>
      <Typography variant="body2" className={classes.copy}>
        Optic monitors your local API traffic for new endpoints, and any changes
        you have made to existing ones. The simplest way to fit Optic into your
        development flow is to alias the command you use to start your API with
        Optic's <Code>api start</Code> command:
      </Typography>
      <DemoStartCommandSetup />
      <Typography
        variant="body2"
        className={classes.copy}
        style={{ marginTop: 14 }}
      >
        Choose your API framework on the right and this wizard will help you
        setup + check the alias. All the changes you make here will be saved to
        your <Code>optic.yml</Code> file.
      </Typography>
      <Typography variant="body2" className={classes.copy}>
        After you set up the alias, begin using api start it whenever you're
        developing. Optic will show you diffs when the process stops.
      </Typography>
    </div>
  );
}

function PortAssumption(props) {
  const classes = useStyles();

  const docs = integrationDocsOptions.find((i) => i.value === props.framework);

  const examplePorts = [
    '`<start_command> --port=$PORT`',
    '`<start_command> --listen=$PORT`',
    '`<start_command> --p=$PORT`',
    '`OUR_ENV_VAR=$PORT <start_command>`',
    '`export OUR_ENV_VAR=$PORT; <start_command>`',
  ];

  const PortTooltip = (
    <span style={{ fontWeight: 600 }}>
      map this variable to a flag your API framework looks for
      <LightTooltip
        interactive
        title={
          <div>
            <Typography variant="overline">examples:</Typography>
            {docs && !docs.data.code_change ? (
              <MarkdownRender
                source={
                  docs.data.preamble + '\n\n```' + docs.data.after + '\n```'
                }
              />
            ) : (
              <MarkdownRender source={examplePorts.join('\n')} />
            )}
          </div>
        }
      >
        <HelpIcon
          style={{ width: 12, height: 12, marginLeft: 5 }}
          color="primary"
        />
      </LightTooltip>
    </span>
  );

  const LookFor = (
    <span style={{ fontWeight: 600 }}>
      look for the <Code>$PORT</Code> variable when starting up (<Code>%PORT%</Code> on Windows)
      <LightTooltip
        interactive
        title={
          <div>
            <Typography variant="overline">examples:</Typography>
              <MarkdownRender
                source={
                  "\n```\n//when your starts and binds to a port...\napi.listen(env['PORT'])\n```"
                }
              />
          </div>
        }
      >
        <HelpIcon
          style={{ width: 12, height: 12, marginLeft: 5 }}
          color="primary"
        />
      </LightTooltip>
      {'.'}
    </span>
  );

  return (
    <div style={{ maxWidth: 670, ...props.style }}>
      <Typography variant="h6" style={{ marginBottom: 18 }}>
        Starting on the correct <Code>$PORT</Code>
      </Typography>
      <Typography variant="body2" className={classes.copy}>
        Optic assumes your API can be started on a specific port, which Optic
        assigns. To do this, Optic provides
        <Code>$PORT</Code> as an environment variable. You'll either need to{' '}
        {PortTooltip}, or modify your code to {LookFor}
      </Typography>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  copy: {
    fontWeight: 200,
    marginBottom: 13,
  },
  copyRoot: {
    paddingTop: 35,
    maxWidth: 1200,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    margin: '0 auto',
    width: '100%',
    paddingLeft: 5,
  },
  root: {
    paddingTop: 30,
    paddingBottom: 100,
    maxWidth: 1200,
    margin: '0 auto',
    minWidth: 900,
    width: '100%',
  },
  promptCheck: {
    marginTop: 10,
    backgroundColor: '#0e2a35',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'flex-start',
    paddingLeft: 15,
    borderLeft: `4px solid ${UpdatedBlue}`,
  },
  pageBg: {
    backgroundImage: `url(${require('../../assets/agsquare_dark_@2X.png')})`,
    backgroundSize: '100px 100px',
  },
}));
