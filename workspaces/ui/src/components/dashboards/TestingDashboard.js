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
import ReportSummary from '../testing/ReportSummary';

import {
  createContext,
  Provider as TestingDashboardContextProvider,
  queriesFromEvents,
  useTestingService,
} from '../../contexts/TestingDashboardContext';
import ReportsNavigation from '../testing/ReportsNav';
import Page from '../Page';
import { useRouterPaths } from '../../RouterPaths';

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
}));

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
              <div className={classes.setupInstructions}>
                <h4>You don't have any captures yet</h4>

                <p>You might need to set them up.</p>
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

// View models
// -----------
// TODO: consider moving these into their own modules or another appropriate spot (probably stable
// for the entire dashboard context if not all of the app?)

function createSpec(specEvents) {
  const { queries } = queriesFromEvents(specEvents);
  const spec = stuffFromQueries(queries);

  return spec;
}
