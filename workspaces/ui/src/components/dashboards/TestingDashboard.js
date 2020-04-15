import React, { useMemo } from 'react';
import Loading from '../navigation/Loading';

// TODO: find a more appropriate place for this logic to live rather than in
// Contexts now that it's being re-used elsewhere.
import { stuffFromQueries } from '../../contexts/RfcContext';

// Components and hooks
// --------------------
import { Switch, Route, Redirect } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import ReportSummary from '../testing/ReportSummary';

import {
  createContext,
  Provider as TestingDashboardContextProvider,
  queriesFromEvents,
  useTestingService,
} from '../../contexts/TestingDashboardContext';
import ReportsNavigation from '../testing/reports-nav';
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
  navigationContainer: {
    // keep then navigation fixed
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',

    borderRight: `1px solid ${theme.palette.grey[300]}`,

    [theme.breakpoints.up('sm')]: {
      width: (theme.breakpoints.values.sm / 3) * 2,
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

  const dashboardContext = useMemo(() => createContext({ service, baseUrl }), [
    hasService,
    baseUrl,
  ]);

  if (!hasService) {
    return <Loading />;
  }

  return (
    <TestingDashboardContextProvider value={dashboardContext}>
      <Page title="Optic Live Contracting Dashboard">
        <Page.Navbar mini={true} />

        <Page.Body padded={false}>
          <div className={classes.root}>
            <div className={classes.navigationContainer}>
              <ReportsNavigation />
            </div>

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

  const error = reportError || specError || captureError;
  if (error) throw error; // allow React error boundaries to render as we're not handling them explicitly

  return (
    <>
      {(loadingReport || loadingSpec || loadingCapture) && <Loading />}

      {report && spec && capture && (
        <ReportSummary
          report={report}
          spec={spec}
          capture={capture}
          currentEndpointId={endpointId}
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
