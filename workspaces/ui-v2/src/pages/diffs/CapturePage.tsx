import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import { makeStyles } from '@material-ui/styles';

import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@material-ui/core';
import { CenteredColumn, PageLayout } from '<src>/components';
import { AddedDarkGreen, OpticBlue, OpticBlueReadable } from '<src>/styles';
import { DiffAccessoryNavigation } from '<src>/pages/diffs/components/DiffAccessoryNavigation';

import { CaptureSelectDropdown } from '<src>/pages/diffs/contexts/CaptureSelectDropdown';
import { LoadingDiffReview } from '<src>/pages/diffs/components/LoadingDiffReview';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import {
  useDiffEnvironmentsRoot,
  useDiffForEndpointLink,
  useDiffUndocumentedUrlsPageLink,
} from '<src>/components/navigation/Routes';
import { EndpointName } from '<src>/components';
import ApproveAll from '<src>/pages/diffs/components/ApproveAll';
import { useCaptures } from '<src>/hooks/useCapturesHook';
import { Code } from '<src>/pages/diffs/components/ICopyRender';
import {
  LiveTrafficLink,
  RunOpticLink,
  RunTestsLink,
  InterceptWithChromeLink,
} from '<src>/constants/SupportLinks';
import { useAnalytics } from '<src>/contexts/analytics';

function CapturePage(props: { showDiff?: boolean }) {
  const { boundaryId, environment } = useParams<{
    boundaryId?: string;
    environment?: string;
  }>();
  const capturesState = useCaptures();
  const history = useHistory();
  const diffEnvironmentsRoot = useDiffEnvironmentsRoot();
  const analytics = useAnalytics();

  const noCaptures = capturesState.captures.length === 0;
  // The only current environment supported is local
  const isValidEnvironment = environment === 'local';
  // TODO this currently does not get reached if we have an invalid boundary,
  // the startDiff hook errors out before we render this component
  const isValidBoundary = !!capturesState.captures.find(
    (capture) => capture.captureId === boundaryId
  );
  const canRedirect = !capturesState.loading && !!capturesState.captures[0];
  const shouldRedirect =
    canRedirect && (!isValidBoundary || !isValidEnvironment || !props.showDiff);

  useEffect(() => {
    if (shouldRedirect) {
      history.push(
        diffEnvironmentsRoot.linkTo(
          'local',
          capturesState.captures[0].captureId
        )
      );
    }
  }, [history, diffEnvironmentsRoot, shouldRedirect, capturesState.captures]);

  if (capturesState.loading) {
    return <LoadingDiffReview />;
  }

  if (shouldRedirect) {
    return null;
  }

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

      <Grid
        container
        spacing={3}
        alignContent="space-between"
        style={{ marginTop: 10 }}
      >
        <Grid xs={4} item>
          <TrafficSource
            slug="start"
            name="Run your API with Optic"
            link={RunOpticLink}
          >
            <Code>api start</Code>
          </TrafficSource>
        </Grid>
        <Grid xs={4} item>
          <TrafficSource
            slug="tests"
            name="Capture Traffic from API Tests"
            link={RunTestsLink}
          >
            <Code>api run test</Code>
          </TrafficSource>
        </Grid>
        <Grid xs={4} item>
          <TrafficSource
            slug="chrome"
            name="Capture Traffic from Chrome"
            link={InterceptWithChromeLink}
          >
            <Code>api intercept --chrome</Code>
          </TrafficSource>
        </Grid>
      </Grid>

      <Divider style={{ marginTop: 30, marginBottom: 20 }} />

      <Typography variant="h6" style={{ fontSize: 18 }}>
        Real Environments [Beta]
      </Typography>

      <Typography variant="body2">
        Optic can securely monitor your API in real environments. Once deployed,
        Optic verifies your API meets its contract, alerts you when it behaves
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
          <Button
            color="primary"
            variant="contained"
            href={LiveTrafficLink}
            target="_blank"
            onClick={() => {
              analytics.userChoseACaptureMethod('live-traffic');
            }}
          >
            Join Beta
          </Button>
        </Grid>
      </Grid>
    </CenteredColumn>
  );
}

export const CapturePageWithoutDiffOrRedirect = (props: any) => (
  <PageLayout>
    <CapturePage {...props} />
  </PageLayout>
);

export const CapturePageWithDiff = (props: any) => (
  <PageLayout AccessoryNavigation={DiffAccessoryNavigation}>
    <CapturePage {...props} showDiff={true} />
  </PageLayout>
);

function DiffCaptureResults() {
  const classes = useStyles();
  const {
    context,
    isDiffHandled,
    reset,
    handledCount,
    getUndocumentedUrls,
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
              const diffCompletedCount =
                i.shapeDiffs.filter((i) => isDiffHandled(i.diffHash())).length +
                i.newRegionDiffs.filter((i) => isDiffHandled(i.diffHash))
                  .length;

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
                      <b>{getUndocumentedUrls().length} undocumented urls.</b>{' '}
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

function TrafficSource(props: {
  name: string;
  children: React.ReactNode;
  slug: string;
  link: string;
}) {
  const classes = useStyles();

  const analytics = useAnalytics();

  return (
    <Card elevation={2} className={classes.trafficSource}>
      <Typography variant="subtitle2" style={{ fontSize: 15, fontWeight: 600 }}>
        {props.name}
      </Typography>
      <div style={{ marginTop: 10, textAlign: 'center' }}>{props.children}</div>
      <Button
        style={{ marginTop: 10 }}
        color="primary"
        href={props.link}
        target="_blank"
        onClick={() => {
          analytics.userChoseACaptureMethod(props.slug);
        }}
        endIcon={<OpenInBrowserIcon />}
      >
        Read Docs
      </Button>
    </Card>
  );
}

const useStyles = makeStyles((theme) => ({
  scroll: {
    overflow: 'scroll',
  },
  trafficSource: {
    padding: 7,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
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
