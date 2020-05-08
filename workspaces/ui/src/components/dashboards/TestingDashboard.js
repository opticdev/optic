import React, { useCallback, useMemo, useState } from 'react';
import Loading from '../navigation/Loading';
import ClassNames from 'classnames';

// TODO: find a more appropriate place for this logic to live rather than in
// Contexts now that it's being re-used elsewhere.
import { stuffFromQueries } from '../../contexts/RfcContext';

// Components and hooks
// --------------------
import { Switch, Route, Redirect, matchPath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import ReportSummary from '../testing/ReportSummary';
import SetupLink from '../testing/SetupLink';
import LiveTestingDiagram from '../../assets/optic-contract-testing-diagram.svg';

import {
  createContext,
  Provider as TestingDashboardContextProvider,
  queriesFromEvents,
  useTestingService,
} from '../../contexts/TestingDashboardContext';
import ReportsNavigation from '../testing/ReportsNav';
import Page from '../Page';
import { useRouterPaths } from '../../RouterPaths';

export default function TestingDashboardPage(props) {
  const { match, service } = props;
  const hasService = !!service;
  const baseUrl = match.url;
  const classes = useStyles();
  const routerPaths = useRouterPaths();

  const currentCaptureId = useMemo(() => {
    const captureMatch = matchPath(
      props.location.pathname,
      routerPaths.testingCapture
    );

    return captureMatch && captureMatch.params.captureId;
  }, [props.location.pathname, routerPaths.testingCapture]);

  const dashboardContext = useMemo(() => createContext({ service, baseUrl }), [
    hasService,
    baseUrl,
  ]);

  const [hasCaptures, setHasCaptures] = useState(true); // be optimistic
  const onCapturesFetched = useCallback((captures) => {
    setHasCaptures(captures && captures.length > 0);
  });

  if (!hasService) {
    return <Loading />;
  }

  return (
    <TestingDashboardContextProvider value={dashboardContext}>
      <Page title="Live Contracting Dashboard">
        <Page.Navbar mini={true} />

        <Page.Body padded={false}>
          <div
            className={ClassNames(classes.root, {
              [classes.isEmpty]: !hasCaptures,
            })}
          >
            <div className={classes.navigationContainer}>
              <ReportsNavigation
                currentCaptureId={currentCaptureId}
                onCapturesFetched={onCapturesFetched}
              />
            </div>

            {hasCaptures ? (
              <div className={classes.reportContainer}>
                <Switch>
                  <Route
                    strict
                    path={routerPaths.testingEndpointDetails}
                    component={TestingDashboard}
                  />
                  <Route
                    strict
                    path={routerPaths.testingCapture}
                    component={TestingDashboard}
                  />
                  <Route component={DefaultReportRedirect} />
                </Switch>
              </div>
            ) : (
              <div className={classes.setup}>
                <div className={classes.setupInstructions}>
                  <h3>No live captures have been found yet.</h3>

                  <p>
                    For help on how to get started with Live Contract Testing,
                    see <SetupLink>the setup instructions</SetupLink>.
                  </p>
                </div>

                <Card className={classes.setupPitch}>
                  {/* <img src={LiveTestingDiagram} /> */}
                  <CardMedia
                    className={classes.setupPitchDiagram}
                    image={LiveTestingDiagram}
                  />

                  <h2>Confidence your API is working as designed</h2>

                  <p>
                    Optic's Live Contract Testing validates your API is working
                    as designed in all your environments. Achieve 100% test
                    coverage of the API's contract from your live traffic.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </Page.Body>
      </Page>
    </TestingDashboardContextProvider>
  );
}

function DefaultReportRedirect(props) {
  const { match } = props;
  const baseUrl = match.url;

  const { loading, result: captures } = useTestingService((service) =>
    service.listCaptures()
  );

  if (loading) {
    return <Loading />;
  }

  if (!captures) {
    // TODO: revisit this state
    return <div>Could not find any reports</div>;
  }

  let mostRecent = captures[0];
  if (mostRecent) {
    return <Redirect to={`${baseUrl}/captures/${mostRecent.captureId}`} />;
  } else {
    // TODO: revisit this UI state
    return <div>You don't have any captures yet</div>;
  }
}

export function TestingDashboard(props) {
  const { captureId, endpointId } = props.match.params;
  const {
    loading: loadingReport,
    result: report,
    error: reportError,
  } = useTestingService((service) => service.loadReport(captureId), [
    captureId,
  ]);
  const { loading: loadingSpec, result: spec, error: specError } = useSpec(
    captureId
  );
  const {
    loading: loadingCapture,
    result: capture,
    error: captureError,
  } = useTestingService((service) => service.loadCapture(captureId), [
    captureId,
  ]);

  const {
    loading: loadingUndocumentedEndpoints,
    result: undocumentedEndpoints,
    error: undocumentedEndpointsError,
  } = useTestingService(
    (service) => service.loadUndocumentedEndpoints(captureId),
    [captureId]
  );

  const error =
    reportError || specError || captureError || undocumentedEndpointsError;
  if (error) throw error; // allow React error boundaries to render as we're not handling them explicitly

  return (
    <>
      {(loadingReport ||
        loadingSpec ||
        loadingCapture ||
        loadingUndocumentedEndpoints) && <Loading />}

      {report && spec && capture && undocumentedEndpoints && (
        <ReportSummary
          report={report}
          spec={spec}
          capture={capture}
          currentEndpointId={endpointId}
          undocumentedEndpoints={undocumentedEndpoints}
        />
      )}
    </>
  );
}

function useSpec(captureId) {
  const { result: specEvents, ...hookRest } = useTestingService(
    (service) => service.loadSpecEvents(captureId),
    [captureId]
  );

  const spec = useMemo(() => {
    if (!specEvents) return null;

    return createSpec(specEvents);
  }, [specEvents]);

  // calling this spec instead of rfcState, to differentiate this as a ViewModel,
  // rather than RfcState.
  return { ...hookRest, result: spec };
}

// Styles
// ------

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column', // stack vertically on smaller screens for now
    },
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row', // horizontally on larger screens
    },
  },

  isEmpty: {},

  navigationContainer: {
    // keep then navigation fixed
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',

    [theme.breakpoints.up('sm')]: {
      width: (theme.breakpoints.values.sm / 3) * 2,
    },

    '$isEmpty &': {
      display: 'none',
    },
  },
  reportContainer: {
    display: 'flex',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'center',
  },

  setup: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(0, 3),
    },
  },
  setupPitch: {
    width: '100%',
    padding: theme.spacing(2, 3),

    [theme.breakpoints.up('md')]: {
      width: (theme.breakpoints.values.md / 4) * 3,
    },

    '& h2': {
      ...theme.typography.h2,
      fontSize: theme.typography.h4.fontSize,
      color: theme.palette.primary.main,
      margin: theme.spacing(4, 0, 2),
    },

    '& p': {
      ...theme.typography.subtitle1,
      fontWeight: theme.typography.fontWeightLight,
    },
  },

  setupPitchDiagram: {
    height: 250,
    margin: theme.spacing(-2, -3, 3),
    backgroundSize: 'cover',
    backgroundPosition: 'top center',
  },

  setupInstructions: {
    width: '100%',
    marginBottom: theme.spacing(3),

    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2, 3),
      width: (theme.breakpoints.values.md / 4) * 3,
    },

    '& h3': {
      ...theme.typography.h4,
      color: theme.palette.primary.main,
    },

    '& p': {
      ...theme.typography.body1,
      // fontSize:
      fontWeight: theme.typography.fontWeightLight,
    },
  },
}));

// View models
// -----------
// TODO: consider moving these into their own modules or another appropriate spot (probably stable
// for the entire dashboard context if not all of the app?)

function createSpec(specEvents) {
  const { queries } = queriesFromEvents(specEvents);
  const spec = stuffFromQueries(queries);

  return spec;
}
