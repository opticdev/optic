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
import ReportSummary, { LoadingReportSummary } from '../testing/ReportSummary';
import SetupLink from '../testing/SetupLink';
import * as SupportLinks from '../support/Links';

import {
  createContext,
  Provider as TestingDashboardContextProvider,
  queriesFromEvents,
  useTestingService,
} from '../../contexts/TestingDashboardContext';
import ReportsNavigation from '../testing/ReportsNav';
import Page from '../Page';
import { useRouterPaths } from '../../RouterPaths';
import TestingPromo from '../marketing/TestingPromo';

const FIRST_CAPTURE_INIT = Symbol();

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

  const [firstCapture, setFirstCapture] = useState(FIRST_CAPTURE_INIT);
  const onCapturesFetched = useCallback((captures) => {
    if (captures && captures.length < 1) return;
    setFirstCapture(captures && captures[0]);
  });
  const hasCaptures = firstCapture === FIRST_CAPTURE_INIT || !!firstCapture; // be optimistic

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
                  {process.env.REACT_APP_TESTING_DASHBOARD_ENDPOINT_DETAILS ===
                    'true' && (
                    <Route
                      strict
                      path={routerPaths.testingEndpointDetails}
                      component={TestingDashboard}
                    />
                  )}
                  <Route
                    strict
                    path={routerPaths.testingCapture}
                    component={TestingDashboard}
                  />
                  {firstCapture !== FIRST_CAPTURE_INIT && firstCapture ? (
                    <Redirect
                      replace
                      to={`${baseUrl}/captures/${firstCapture.captureId}`}
                    />
                  ) : (
                    <LoadingReportSummary />
                  )}
                </Switch>
              </div>
            ) : (
              <div className={classes.setup}>
                <div className={classes.setupInstructions}>
                  <h3>No live captures have been found yet.</h3>

                  <p>
                    For help getting started with Live Contract Testing,
                    <SetupLink>contact the maintainers</SetupLink>.
                  </p>

                  <p>
                    Think this might not be right? Feel free to{' '}
                    <a
                      href={SupportLinks.Contact(
                        'Problem: No live captures found'
                      )}
                    >
                      contact us about it
                    </a>
                    .
                  </p>
                </div>

                <TestingPromo />
              </div>
            )}
          </div>
        </Page.Body>
      </Page>
    </TestingDashboardContextProvider>
  );
}

export function TestingDashboard(props) {
  const { captureId, endpointId } = props.match.params;
  const {
    loading: loadingReport,
    result: report,
    error: reportError,
    notFound: reportNotFound,
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
    notFound: captureNotFound,
  } = useTestingService((service) => service.loadCapture(captureId), [
    captureId,
  ]);

  const {
    loading: loadingUndocumentedEndpoints,
    result: undocumentedEndpoints,
    error: undocumentedEndpointsError,
    notFound: undocumentedEndpointsNotFound,
  } = useTestingService(
    (service) => service.loadUndocumentedEndpoints(captureId),
    [captureId]
  );

  const error =
    reportError || specError || captureError || undocumentedEndpointsError;
  if (error) throw error; // allow React error boundaries to render as we're not handling them explicitly

  const notFound =
    reportNotFound || captureNotFound || undocumentedEndpointsNotFound;

  if (notFound) {
    return <ReportNotFound />;
  }

  return (
    <>
      {(loadingReport ||
        loadingSpec ||
        loadingCapture ||
        loadingUndocumentedEndpoints) && <LoadingReportSummary />}

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

function ReportNotFound(props) {
  const classes = useStyles();
  return (
    <div className={classes.notFound}>
      <h4>The Report you're trying to access could not be found.</h4>

      <p>
        Looking for the right report? All available reports are listed in the
        navigation on the left.
      </p>

      <p>
        Think this might not be right? Feel free to{' '}
        <a href={SupportLinks.Contact('Problem: Report not found')}>
          contact us about it
        </a>
        .
      </p>
    </div>
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

  notFound: {
    padding: theme.spacing(3, 4),

    '& h4': {
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
