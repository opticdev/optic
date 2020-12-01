import React, { useContext, useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  AddedGreen,
  RemovedRed,
  SubtleBlueBackground,
  UpdatedBlue,
} from '../../../theme';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DoneIcon from '@material-ui/icons/Done';
import WarningIcon from '@material-ui/icons/Warning';
import { Code } from './CodeBlock';
import { MarkdownRender } from '../fetch-docs/BuildMD';
import { CommonIssues } from '../fetch-docs/IntegrationDocs';
import { GuidedFlowContext } from './base';
import { TextField } from '@material-ui/core';
import { CHANGED_START_COMMAND } from './events';
import { StartCommandInput } from './StartCommandInput';
import { ShowCurrentOpticYml } from './UpdateOpticYml';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 19,
    marginBottom: 190,
  },
}));

const PassedFailed = (props) =>
  props.passed ? (
    <DoneIcon style={{ color: AddedGreen, marginRight: 9 }} />
  ) : (
    <WarningIcon style={{ color: RemovedRed, marginRight: 9 }} />
  );

export function CheckHelp(props) {
  const { results } = props;
  const classes = useStyles();
  const { state } = useContext(GuidedFlowContext);

  if (!results || results.passed) {
    return null;
  }

  console.log('results', results);

  // const results = {
  //   passed: false,
  //   mode: 'Manual',
  //   taskName: 'start-proxy',
  //   task: {
  //     inboundUrl: 'http://localhost:3005',
  //     targetUrl: 'http://PIZZA.NOTREAL.QS',
  //   },
  //   manual: {
  //     proxyCanStartAtInboundUrl: { passed: true, hostname: 'localhost:3005' },
  //     proxyTargetUrlResolves: {
  //       passed: false,
  //       targetHostname: 'pizza.notreal.qs:80',
  //     },
  //   },
  // };
  //

  const commandIsInvalid =
    Boolean(results.recommended) &&
    (!results.recommended.commandIsLongRunning.passed ||
      !results.recommended.apiProcessStartsOnAssignedHost.passed ||
      !results.recommended.apiProcessStartsOnAssignedPort.passed);

  const recommendedChecks = Boolean(results.recommended) && (
    <>
      <Typography
        variant="subtitle1"
        style={{ fontWeight: 800, marginBottom: 12 }}
      >
        Problems with command <Code>{results.task.command}</Code>.
      </Typography>

      <AssertionRender
        {...results.recommended.commandIsLongRunning}
        resolution={CommonIssues.commandProcess.resolution}
        assertion={CommonIssues.commandProcess.shortTitle}
      />
      <AssertionRender
        {...results.recommended.apiProcessStartsOnAssignedHost}
        resolution={CommonIssues.commandHost.resolution}
        assertion={
          <>
            On the host Optic assigns it <Code>$OPTIC_API_HOST</Code> (current:{' '}
            <Code
              children={
                results.recommended.apiProcessStartsOnAssignedHost.expectedHost
              }
            />
            )
          </>
        }
      />
      <AssertionRender
        {...results.recommended.apiProcessStartsOnAssignedPort}
        resolution={CommonIssues.commandPort.resolution}
        assertion={
          <>
            On the port Optic assigns it <Code>$OPTIC_API_PORT</Code> (current:{' '}
            <Code
              children={results.recommended.apiProcessStartsOnAssignedPort.expectedPort.toString()}
            />
            )
          </>
        }
      />

      <Typography
        variant="subtitle1"
        style={{ fontWeight: 800, marginBottom: 12, marginTop: 44 }}
      >
        Given this inboundUrl <Code>{results.task.inboundUrl}</Code>
      </Typography>

      <AssertionRender
        {...results.recommended.proxyCanStartAtInboundUrl}
        resolution={CommonIssues.inboundUrlStart.resolution}
        assertion={
          <>
            Optic is able to start its proxy here{' '}
            <Code
              children={results.recommended.proxyCanStartAtInboundUrl.hostname}
            />
          </>
        }
      />
    </>
  );

  const manualCheck = Boolean(results.manual) && (
    <>
      <Typography
        variant="subtitle1"
        style={{ fontWeight: 800, marginBottom: 12 }}
      >
        Given this inboundUrl <Code>{results.task.inboundUrl}</Code>
      </Typography>

      <AssertionRender
        {...results.manual.proxyCanStartAtInboundUrl}
        resolution={CommonIssues.inboundUrlStart.resolution}
        assertion="Optic proxy is able to start its proxy here"
      />

      <Typography
        variant="subtitle1"
        style={{ fontWeight: 800, marginBottom: 12, marginTop: 44 }}
      >
        Given this targetUrl <Code>{results.task.targetUrl}</Code>
      </Typography>

      <AssertionRender
        {...results.manual.proxyTargetUrlResolves}
        resolution={CommonIssues.targetUrlResolve.resolution}
        assertion={
          <>
            Is resolvable from <Code>localhost</Code>
          </>
        }
      />
    </>
  );

  return (
    <div className={classes.root}>
      <ShowCurrentOpticYml
        rawConfig={results.rawConfig}
        commandIsInvalid={commandIsInvalid}
      />
      {recommendedChecks}
      {manualCheck}
    </div>
  );
}

function AssertionRender(props) {
  const { assertion, resolution, passed } = props;
  const [expanded, setExpanded] = useState(!passed);

  useEffect(() => {
    setExpanded(!passed);
  }, [passed]);

  return (
    <Accordion
      elevation={1}
      expanded={expanded}
      onClick={() => {
        if (!passed) {
          setExpanded(!expanded);
        }
      }}
    >
      <AccordionSummary expandIcon={!passed && <ExpandMoreIcon />}>
        <FormControlLabel
          control={<PassedFailed passed={passed} />}
          label={assertion}
          style={{ paddingLeft: 18 }}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Typography color="textSecondary">
          <MarkdownRender source={resolution} />
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
