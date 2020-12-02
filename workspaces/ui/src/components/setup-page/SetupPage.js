import React, { useEffect, useMemo, useState } from 'react';
import Page from '../Page';
import { makeStyles } from '@material-ui/core/styles';
import { useMachine } from '@xstate/react';
import { newSetupAndCheckMachine } from './setup-and-check-machine';
import { useServices } from '../../contexts/SpecServiceContext';
import { ShowCurrentOpticYml } from './yaml/UpdateOpticYml';
import Grid from '@material-ui/core/Grid';
import { HelperCard } from './HelperCard';
import { FrameworkHelper } from './FrameworkHelper';
import { useLatestEvent, useUserTracking } from './setup-api/useUserTracking';
import { ApiCheckCompleted } from '@useoptic/analytics/lib/events/onboarding';
import Box from '@material-ui/core/Box';

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
  const saving = state.matches('saving');

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
                <ShowCurrentOpticYml
                  saving={saving}
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
                <div style={{ marginTop: 20 }}>{cards}</div>
              </div>
            </>
          )}
        </Box>
      </Page.Body>
    </Page>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 18,
    maxWidth: 1500,
    minWidth: 900,
    width: '100%',
  },
  pageBg: {
    backgroundImage: `url(${require('../../assets/agsquare_dark_@2X.png')})`,
    backgroundSize: '100px 100px',
  },
}));

function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
