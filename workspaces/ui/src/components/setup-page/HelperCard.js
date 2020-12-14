import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import HelpIcon from '@material-ui/icons/Help';
import WarningIcon from '@material-ui/icons/Warning';
import { Card, Collapse, Typography } from '@material-ui/core';
import {
  AddedGreen,
  AddedGreenBackground,
  ChangedYellow,
  ChangedYellowBackground,
  RemovedRed,
  RemovedRedBackground,
  SubtleBlueBackground,
  UpdatedBlueBackground,
} from '../../theme';
import { Code } from './setup-api/CodeBlock';
import { CommonIssues } from './fetch-docs/IntegrationDocs';
import Box from '@material-ui/core/Box';
import { LightTooltip } from '../tooltips/LightTooltip';
import { MarkdownRender } from './fetch-docs/BuildMD';

const assertionsMap = {
  command: [
    {
      assertion: CommonIssues.commandProcess,
      getStatus: (result) =>
        result.recommended && result.recommended.commandIsLongRunning,
    },
    {
      assertion: CommonIssues.commandPort,
      getStatus: (result) =>
        result.recommended && result.recommended.apiProcessStartsOnAssignedPort,
    },
    {
      assertion: CommonIssues.commandHost,
      getStatus: (result) =>
        result.recommended && result.recommended.apiProcessStartsOnAssignedHost,
    },
  ],
  inboundUrl: [
    {
      assertion: CommonIssues.inboundUrlStart,
      getStatus: (result) => {
        if (result.recommended)
          return result.recommended.proxyCanStartAtInboundUrl;
        if (result.manual) return result.manual.proxyCanStartAtInboundUrl;
      },
    },
  ],
  targetUrl: [
    {
      assertion: CommonIssues.targetUrlResolve,
      getStatus: (result) =>
        result.manual && result.manual.proxyTargetUrlResolves,
    },
  ],
};

const quickSummary = (mode) => {
  if (mode === 'recommended') {
    return {
      command: 'how your API is started',
      inboundUrl: 'where the API should listen locally',
    };
  } else if (mode === 'manual') {
    return {
      targetUrl: 'the hostname of the API ie devapi.site.com',
      inboundUrl: 'where you want the Optic proxy to start',
    };
  }
};

export function HelperCard({ setting, mode, result, noChecks, value }) {
  const classes = useStyles();

  const assertions = assertionsMap[setting] || [];

  return (
    <Card elevation={3} className={classes.root}>
      <div
        className={classes.header}
        // style={{ backgroundColor: ChangedYellowBackground }}
      >
        <Code
          style={{
            color: 'white',
            fontWeight: 800,
            overflow: 'hidden',
            wordWrap: 'break-word',
          }}
        >
          {(value && value.value) || '________'}
        </Code>
        <Typography
          variant="caption"
          style={{ color: '#999696', fontWeight: 100, paddingLeft: 2 }}
        >
          <span style={{ fontWeight: 800 }}>{setting}</span>:{' '}
          {quickSummary(mode)[setting]}
        </Typography>
      </div>
      <Collapse in={!noChecks}>
        <div className={classes.assertions}>
          <Typography variant="caption" style={{ color: '#999696' }}>
            The <strong>{setting}</strong> parameter:
          </Typography>

          {assertions.map((i, index) => (
            <AssertionMini
              issue={i.assertion}
              noChecks={noChecks}
              result={result && i.getStatus(result)}
              key={'assertion' + index}
            />
          ))}
        </div>
      </Collapse>
    </Card>
  );
}

function AssertionMini({ issue, noChecks, result }) {
  const { title, shortTitle, resolution } = issue;
  const passed = result && result.passed;
  const failed = !passed && !noChecks;

  const classes = useStyles();
  return (
    <div>
      <Box display="flex" flexDirection="row" alignItems="center">
        <DotIndicator {...{ passed, failed }} />
        <span style={{ color: '#e2e2e2', marginLeft: 5, fontWeight: 800 }}>
          {shortTitle}
        </span>
      </Box>
      {failed && (
        <LightTooltip
          interactive
          title={
            <div>
              <MarkdownRender source={resolution} />
            </div>
          }
        >
          <Typography
            variant="overline"
            color="error"
            className={classes.issue}
          >
            Resolve Issue
          </Typography>
        </LightTooltip>
      )}
    </div>
  );
}

export function DotIndicator({ untested, passed, failed }) {
  let color = ChangedYellow;

  if (passed) {
    color = AddedGreen;
  }
  if (failed) {
    color = RemovedRed;
  }

  return <FiberManualRecordIcon style={{ color, width: 15, height: 15 }} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#0e2a35',
    marginBottom: 14,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 9,
    padding: 7,
    marginBottom: 5,
  },
  error: {
    backgroundColor: 'white',
    border: `2px solid ${RemovedRed}`,
    padding: 8,
  },
  issue: {
    cursor: 'pointer',
    marginLeft: 20,
  },
  headertop: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  assertions: {
    padding: 8,
    paddingTop: 0,
    borderTopColor: '#736d6d',
    borderTop: `1px solid`,
  },
}));
