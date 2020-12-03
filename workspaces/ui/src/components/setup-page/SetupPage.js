import React, { useEffect, useMemo, useState } from 'react';
import Page from '../Page';
import { makeStyles } from '@material-ui/core/styles';
import { useMachine } from '@xstate/react';
import classnames from 'classnames';
import { newSetupAndCheckMachine } from './setup-and-check-machine';
import { useServices } from '../../contexts/SpecServiceContext';
import { ShowCurrentOpticYml } from './yaml/UpdateOpticYml';
import Grid from '@material-ui/core/Grid';
import { HelperCard } from './HelperCard';
import { FrameworkHelper } from './FrameworkHelper';
import { useLatestEvent, useUserTracking } from './setup-api/useUserTracking';
import { ApiCheckCompleted } from '@useoptic/analytics/lib/events/onboarding';
import Box from '@material-ui/core/Box';
import { useDebounce } from './useDebounceHook';
import { Paper, Typography, Zoom } from '@material-ui/core';
import { Code } from './setup-api/CodeBlock';
import {
  SubtleBlueBackground,
  UpdatedBlue,
  UpdatedBlueBackground,
} from '../../theme';
import { defaultCommandInit } from '@useoptic/cli-config/build/helpers/initial-task';
import { CheckPassed } from './CheckPassed';

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
      : [];

  return (
    <Page title="Setup your API Start task">
      <Page.Navbar mini={true} />
      <Page.Body padded={true} className={classes.pageBg}>
        <Box display="flex" className={classes.root}>
          {!state.matches('loading') && (
            <>
              <div style={{ minWidth: 600, flex: 1 }}>
                <h2>Setup a task to start your API with Optic</h2>
                <p>Optic uses an <code>optic.yml</code> file to define how it will start and observe your API project's traffic. Choose a framework from the drop-down on the right, and Optic will guide you through setting up and checking the necessary parameters. There is a manual configuration mode for those who need more control, as well.</p>
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
                <div style={{ marginTop: 20 }}>
                  {cards}
                  <PromptCheck
                    hasChanges={hasChanges}
                    stagedConfig={stagedConfig}
                    lastResult={lastCheckResult}
                    focusTask={focusTask}
                    command={stagedRanges.task && stagedRanges.task.command}
                  />
                </div>
              </div>
            </>
          )}
        </Box>
        <CheckPassed open={lastCheckResult && lastCheckResult.passed} />
      </Page.Body>
    </Page>
  );
}

function PromptCheck({ hasChanges, lastResult, stagedConfig, focusTask }) {
  const classes = useStyles();
  const shouldShow =
    !lastResult || (lastResult && lastResult.rawConfig !== stagedConfig);

  return (
    <Zoom in={shouldShow}>
      <Paper className={classes.promptCheck}>
        <Typography variant="caption">
          Run this check command in your terminal:
        </Typography>
        <Box display="flex" alignItems="center" style={{ marginTop: 15 }}>
          <img
            src={require('../../assets/open-terminal.svg')}
            style={{ width: 70, marginRight: 15 }}
          />
          <Code>api check {focusTask}</Code>
        </Box>
      </Paper>
    </Zoom>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 18,
    maxWidth: 1500,
    minWidth: 900,
    width: '100%',
  },
  promptCheck: {
    backgroundColor: SubtleBlueBackground,
    paddingTop: 15,
    paddingBottom: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: `4px solid ${UpdatedBlue}`,
  },
  pageBg: {
    backgroundImage: `url(${require('../../assets/agsquare_dark_@2X.png')})`,
    backgroundSize: '100px 100px',
  },
}));
