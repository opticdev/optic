import React, { useEffect } from 'react';
import { CenteredColumn } from '../../layouts/CenteredColumn';
import { makeStyles } from '@material-ui/styles';

import {
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@material-ui/core';
import { AddedDarkGreen, OpticBlue, OpticBlueReadable } from '../../theme';
import { CaptureSelectDropdown } from '../../diffs/contexts/CaptureSelectDropdown';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import {
  useDiffEnvironmentsRoot,
  useDiffForEndpointLink,
  useDiffUndocumentedUrlsPageLink,
} from '../../navigation/Routes';
import { EndpointName } from '../../common';
import { useHistory } from 'react-router-dom';
import ApproveAll from '../../diffs/render/ApproveAll';
import { useCaptures } from '../../hooks/useCapturesHook';

export function CapturePage(props: { showDiff?: boolean }) {
  const capturesState = useCaptures();
  const history = useHistory();
  const diffEnvironmentsRoot = useDiffEnvironmentsRoot();

  const noCaptures =
    !capturesState.loading && capturesState.captures.length === 0;

  useEffect(() => {
    if (
      !capturesState.loading &&
      !props.showDiff &&
      capturesState.captures[0]
    ) {
      history.push(
        diffEnvironmentsRoot.linkTo(
          'local',
          capturesState.captures[0].captureId
        )
      );
    }
  }, [capturesState, history, diffEnvironmentsRoot, props.showDiff]);

  return (
    <CenteredColumn maxWidth="md" style={{ paddingTop: 50, paddingBottom: 50 }}>
      {noCaptures && (
        <Typography variant="h6">
          No Captured Traffic to Diff. Learn how to collect traffic below.
        </Typography>
      )}

      {props.showDiff && <DiffCaptureResults />}

      <Divider style={{ marginTop: 200, marginBottom: 20 }} />

      <Typography variant="h6" style={{ fontSize: 18 }}>
        Capture Traffic From Local Environments
      </Typography>

      <Typography variant="body2">
        links to all the options....tasks, sdks, etc
      </Typography>

      <Divider style={{ marginTop: 30, marginBottom: 20 }} />

      <Typography variant="h6" style={{ fontSize: 18 }}>
        Real Environments [Beta]
      </Typography>

      <Typography variant="body2">
        Optic can securely monitor your API in real environments. Once deployed,
        Optic verifies your API meets its contract, alert you when it behaves
        unexpectedly, and help you understand what parts of your API each
        consumer relies upon.
      </Typography>

      <Grid container spacing={3} style={{ marginTop: 5 }}>
        <Grid xs={4} item style={{ opacity: 0.4 }}>
          <RealEnvColumn
            name={'development'}
            examples={[
              { buildN: 19, diffs: '1 diff', requests: '1.1k' },
              { buildN: 18, diffs: '4 diffs', requests: '6.1k' },
            ]}
          />
        </Grid>
        <Grid xs={4} item style={{ opacity: 0.4 }}>
          <RealEnvColumn
            name={'staging'}
            examples={[
              { buildN: 13, diffs: '3 diffs', requests: '12.2k' },
              { buildN: 12, diffs: '12 diffs', requests: '7.2k' },
            ]}
          />
        </Grid>
        <Grid
          xs={4}
          item
          justifyContent="center"
          display="flex"
          flexDirection="column"
          component={Box}
        >
          <Typography
            variant="body2"
            style={{
              fontFamily: 'Ubuntu Mono',
              marginBottom: 5,
              marginTop: -15,
            }}
          >
            Ready to put Optic into a real environment?
          </Typography>
          <Button color="secondary" variant="contained">
            Join Beta
          </Button>
        </Grid>
      </Grid>
    </CenteredColumn>
  );
}

function DiffCaptureResults() {
  const classes = useStyles();
  const {
    context,
    isDiffHandled,
    reset,
    handledCount,
  } = useSharedDiffContext();
  const history = useHistory();
  const diffsGroupedByEndpoints = context.results.diffsGroupedByEndpoint;
  const diffUndocumentedUrlsPageLink = useDiffUndocumentedUrlsPageLink();
  const diffForEndpointLink = useDiffForEndpointLink();
  const hasUndocumented = context.results.displayedUndocumentedUrls.length > 0;

  const [handled, total] = handledCount;

  const handleChangeToEndpointPage = (pathId: string, method: string) => {
    history.push(diffForEndpointLink.linkTo(pathId, method));
  };
  const handleChangeToUndocumentedUrlPage = () => {
    history.push(diffUndocumentedUrlsPageLink.linkTo());
  };

  const canApplyAll =
    handled < total && context.results.diffsGroupedByEndpoint.length > 0;

  const canReset = handled > 0 || context.pendingEndpoints.length > 0;

  return (
    <>
      <div className={classes.leading}>
        <CaptureSelectDropdown />
        <div style={{ flex: 1 }} />
        <Button
          size="small"
          color="primary"
          onClick={reset}
          disabled={!canReset}
        >
          Reset
        </Button>
        <ApproveAll disabled={!canApplyAll} />
      </div>

      <Paper elevation={1}>
        <List dense>
          {diffsGroupedByEndpoints.length > 0 ? (
            diffsGroupedByEndpoints.map((i, index) => {
              const diffCount = i.newRegionDiffs.length + i.shapeDiffs.length;
              const diffCompletedCount = i.shapeDiffs.filter((i) =>
                isDiffHandled(i.diffHash())
              ).length;

              const remaining = diffCount - diffCompletedCount;
              const done = remaining === 0;

              return (
                <ListItem
                  disableRipple
                  button
                  key={index}
                  onClick={() =>
                    !done && handleChangeToEndpointPage(i.pathId, i.method)
                  }
                  style={{
                    cursor: done ? 'default' : 'pointer',
                  }}
                >
                  <EndpointName
                    leftPad={3}
                    method={i.method}
                    fullPath={i.fullPath}
                    fontSize={14}
                  />
                  <ListItemSecondaryAction>
                    <div>
                      {done ? (
                        <div
                          className={classes.text}
                          style={{ color: AddedDarkGreen }}
                        >
                          Done ✓
                        </div>
                      ) : (
                        <div className={classes.text}>
                          {diffCompletedCount}/{diffCount} reviewed
                        </div>
                      )}
                    </div>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          ) : (
            <div
              className={classes.text}
              style={{
                padding: '8px 16px',
              }}
            >
              No diffs are left to review
            </div>
          )}
          {hasUndocumented && (
            <>
              {diffsGroupedByEndpoints.length > 0 && (
                <Divider style={{ marginTop: 5, marginBottom: 5 }} />
              )}
              <ListItem
                disableRipple
                button
                key={'undocumented'}
                onClick={handleChangeToUndocumentedUrlPage}
              >
                <ListItemText
                  primaryTypographyProps={{
                    style: {
                      fontSize: 14,
                      color: '#697386',
                      fontWeight: 400,
                    },
                  }}
                  primary={
                    <>
                      Optic observed{' '}
                      <b>
                        {context.results.displayedUndocumentedUrls.length}{' '}
                        undocumented urls.
                      </b>{' '}
                      Click here to document new endpoints
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <div className={classes.text}>
                    {context.pendingEndpoints.filter((i) => i.staged).length}{' '}
                    endpoints added
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
            </>
          )}
        </List>
      </Paper>
    </>
  );
}

export function RealEnvColumn({
  name,
  examples,
}: {
  name: string;
  examples: LiveRowProps[];
}) {
  return (
    <Paper elevation={1} square={false} style={{ overflow: 'hidden' }}>
      <Typography
        variant="body1"
        style={{
          fontFamily: 'Ubuntu Mono',
          color: '#e2e2e2',
          fontSize: 20,
          paddingLeft: 10,
          backgroundColor: OpticBlue,
        }}
      >
        {name}
      </Typography>
      <List dense>
        {examples.map((i, index) => {
          return <ExampleLiveRow key={index} {...i} />;
        })}
      </List>
    </Paper>
  );
}

type LiveRowProps = {
  buildN: number;
  requests: string;
  diffs: string;
};

function ExampleLiveRow({ buildN, requests, diffs }: LiveRowProps) {
  return (
    <ListItem dense>
      <ListItemText
        primaryTypographyProps={{ variant: 'subtitle2' }}
        primary={`build #${buildN}`}
        secondary={`${requests} observed requests. ${diffs}`}
      />
    </ListItem>
  );
}

const useStyles = makeStyles((theme) => ({
  scroll: {
    overflow: 'scroll',
  },
  locationHeader: {
    fontSize: 10,
    height: 33,
  },
  leading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  text: {
    textTransform: 'none',
    marginTop: -3,
    userSelect: 'none',
    color: OpticBlueReadable,
  },
}));
