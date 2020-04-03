import React, { useMemo } from 'react';
import Loading from '../navigation/Loading';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import { opticEngine } from '@useoptic/domain';
import {
  createContext,
  Provider as TestingDashboardContextProvider,
  queriesFromEvents,
  useTestingService
} from '../../contexts/TestingDashboardContext';
import ReportsNavigation from '../testing/reports-nav';
import Page from '../Page';

// TODO: find a more appropriate place for this logic to live rather than in
// Contexts now that it's being re-used elsewhere.
import {
  flattenPaths,
  flatMapOperations
} from '../../contexts/ApiOverviewContext';
import * as uniqBy from 'lodash.uniqby';
import { stuffFromQueries } from '../../contexts/RfcContext';
import { StableHasher } from '../../utilities/CoverageUtilities';

const CoverageConcerns = opticEngine.com.useoptic.coverage;

export default function TestingDashboardContainer(props) {
  const { match, service } = props;
  const hasService = !!service;
  const baseUrl = match.url;

  const dashboardContext = useMemo(() => createContext({ service, baseUrl }), [
    hasService,
    baseUrl
  ]);

  if (!hasService) {
    return <Loading />;
  }

  return (
    <TestingDashboardContextProvider value={dashboardContext}>
      <Page title="Optic Live Contracting Dashboard">
        <Page.Navbar
          mini={true}
          baseUrl={baseUrl}
        />

        <Page.Body>
          <ReportsNavigation />
          <Switch>
            <Route
              path={`${baseUrl}/captures/:captureId`}
              component={TestingDashboard}
            />
            <Route component={DefaultReportRedirect} />
          </Switch>
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
  const { captureId } = props.match.params;
  const { loading: loadingReport, result: report } = useTestingService(
    (service) => service.loadReport(captureId),
    [captureId]
  );
  const { loading: loadingSpec, result: spec } = useSpec(captureId);
  const { loading: loadingCapture, result: capture } = useTestingService(
    (service) => service.loadCapture(captureId),
    [captureId]
  );

  return (
    <div>
      <h2>Live Contract Testing Dashboard for capture {captureId}</h2>

      {(loadingReport || loadingSpec || loadingCapture) && <Loading />}

      {report && spec && capture && (
        <TestingReport report={report} spec={spec} capture={capture} />
      )}
    </div>
  );
}

export function TestingReport(props) {
  const { capture, report, spec } = props;

  const summary = useMemo(() => createSummary(capture, spec, report), [
    capture,
    spec,
    report
  ]);
  const {
    endpoints,
    totalInteractions,
    totalCompliantInteractions,
    totalDiffs,
    totalUnmatchedPaths
  } = summary;

  return (
    <div>
      <h3>Testing report</h3>

      <h4>
        Summary for {summary.apiName}{' '}
        <small>
          Captured from {summary.createdAt} until {summary.updatedAt}
        </small>
      </h4>
      <ul>
        <li>Total interactions: {totalInteractions}</li>
        <li>Compliant interactions: {totalCompliantInteractions}</li>
        <li>Unmatched paths: {totalUnmatchedPaths}</li>
        <li>Total diffs: {totalDiffs}</li>
      </ul>

      <h4>Endpoints</h4>

      {endpoints.length > 0 ? (
        <ul>
          {endpoints.map((endpoint) => (
            <li key={endpoint.request.requestId}>
              <strong>{endpoint.request.httpMethod}</strong>{' '}
              {endpoint.path.name}: ({endpoint.counts.compliant}/
              {endpoint.counts.interactions} interactions compliant)
            </li>
          ))}
        </ul>
      ) : (
        // @TODO: revisit this empty state
        <p>No endpoints have been documented yet</p>
      )}
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

// View models
// -----------
// TODO: consider moving these into their own modules or another appropriate spot (probably stable
// for the entire dashboard context if not all of the app?)

function createSpec(specEvents) {
  const { queries } = queriesFromEvents(specEvents);
  const { apiName, pathsById, requestIdsByPathId, requests } = stuffFromQueries(
    queries
  );

  return {
    apiName,
    pathsById,
    requestIdsByPathId,
    requests
  };
}

// TODO: give this building of a ViewModel a more appropriate spot.
function createSummary(capture, spec, report) {
  const { apiName, pathsById, requestIdsByPathId, requests } = spec;

  const pathIds = Object.keys(pathsById);
  const flattenedPaths = flattenPaths('root', pathsById, 0, '', []);
  const allPaths = [flattenedPaths, ...flattenedPaths.children];

  const endpoints = uniqBy(
    flatMapOperations(allPaths, {
      requests,
      requestIdsByPathId
    }),
    'requestId'
  ).map(({ request, path }) => {
    const { pathId } = path;
    const { requestDescriptor, isRemoved, requestId } = request;
    const { httpMethod } = requestDescriptor;

    const interactionsCounts = getCoverageCount(
      CoverageConcerns.TotalForPathAndMethod(pathId, httpMethod)
    );
    const diffsCount = 1; // TODO: Hardcoded test value, replace by deriving from report,
    const compliantCount = interactionsCounts - diffsCount;

    return {
      request: {
        requestId,
        httpMethod,
        isRemoved
      },
      path: {
        name: path.name
      },
      counts: {
        interactions: interactionsCounts,
        diffs: diffsCount,
        compliant: compliantCount
      }
    };
  });

  const totalInteractions = getCoverageCount(
    CoverageConcerns.TotalInteractions()
  );
  const totalUnmatchedPaths = getCoverageCount(
    CoverageConcerns.TotalUnmatchedPath()
  );

  const totalDiffs = 1; // TODO: Hardcoded test value, replace by deriving from report
  const totalCompliantInteractions = totalInteractions - totalDiffs;

  return {
    apiName,
    createdAt: capture.createdAt,
    updatedAt: capture.updatedAt,
    endpoints,
    totalInteractions,
    totalUnmatchedPaths,
    totalDiffs,
    totalCompliantInteractions
  };

  function getCoverageCount(concern) {
    const key = StableHasher.hash(concern);
    return report.coverageCounts[key] || 0;
  }
}
