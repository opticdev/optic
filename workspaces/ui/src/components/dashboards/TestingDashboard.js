import React, { useMemo } from 'react';
import Loading from '../navigation/Loading';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import { opticEngine, Queries } from '@useoptic/domain';
import {
  createContext,
  Provider as TestingDashboardContextProvider,
  useTestingService
} from '../../contexts/TestingDashboardContext';
import ReportsNavigation from '../testing/reports-nav';

// TODO: find a more appropriate place for this logic to live rather than in
// Contexts now that it's being re-used elsewhere.
import {
  flattenPaths,
  fuzzyConceptFilter,
  fuzzyPathsFilter,
  flatMapOperations
} from '../../contexts/ApiOverviewContext';
import { stuffFromQueries } from '../../contexts/RfcContext';
import * as uniqBy from 'lodash.uniqby';

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
      <Switch>
        <Route
          path={`${baseUrl}/captures/:captureId`}
          component={TestingDashboard}
        />
        <Route component={DefaultReportRedirect} />
      </Switch>
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

  return (
    <div>
      <ReportsNavigation />

      <h2>Live Contract Testing Dashboard for capture {captureId}</h2>

      {(loadingReport || loadingSpec) && <Loading />}

      {report && spec && <TestingReport report={report} spec={spec} />}
    </div>
  );
}

export function TestingReport(props) {
  const { report, spec } = props;
  const { counts } = report;
  const { endpoints } = spec;

  return (
    <div>
      <h3>Testing report</h3>

      <h4>Summary for {spec.apiName}</h4>
      <ul>
        <li>Created at: {report.createdAt}</li>
        <li>Last updated: {report.updatedAt}</li>
        <li>Total interactions: {counts.totalInteractions}</li>
        <li>Compliant interactions: {counts.totalCompliantInteractions}</li>
        <li>Unmatched paths: {counts.totalUnmatchedPaths}</li>
        <li>Total diffs: {counts.totalDiffs}</li>
      </ul>

      <h4>Endpoints</h4>

      {endpoints.length > 0 ? (
        <ul>
          {endpoints.map((endpoint) => (
            <li key={endpoint.request.requestId}>
              <strong>{endpoint.request.httpMethod}</strong>{' '}
              {endpoint.path.name}
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
  const { result: events, ...hookRest } = useTestingService(
    (service) => service.loadSpec(captureId),
    [captureId]
  );

  // calling this spec instead of rfcState, to differentiate this as a ViewModel,
  // rather than RfcState.
  let spec = null;
  if (events) {
    spec = specFromEvents(events);
  }

  return { ...hookRest, result: spec };
}

// TODO: give this building of a ViewModel a more appropriate spot.
export function specFromEvents(events) {
  const { contexts } = opticEngine.com.useoptic;
  const { RfcServiceJSFacade } = contexts.rfc;
  const rfcServiceFacade = RfcServiceJSFacade();
  const eventStore = rfcServiceFacade.makeEventStore();
  const rfcId = 'testRfcId';

  // @TODO: figure out if it's wise to stop the parsing of JSON from the response, to prevent
  // parse -> stringify -> parse
  eventStore.bulkAdd(rfcId, JSON.stringify(events));
  const rfcService = rfcServiceFacade.makeRfcService(eventStore);
  const queries = Queries(eventStore, rfcService, rfcId);

  const { apiName, pathsById, requestIdsByPathId, requests } = stuffFromQueries(
    queries
  );
  const pathTree = flattenPaths('root', pathsById);
  const pathIdsFiltered = fuzzyPathsFilter(pathTree, '');
  const pathTreeFiltered = flattenPaths(
    'root',
    pathsById,
    0,
    '',
    pathIdsFiltered
  );
  const allPaths = [pathTreeFiltered, ...pathTreeFiltered.children];
  const endpoints = uniqBy(
    flatMapOperations(allPaths, { requests, requestIdsByPathId }),
    'requestId'
  ).map(({ request, path }) => ({
    endpointId: `${request.requestId}${path.pathId}`,
    request: {
      requestId: request.requestId,
      httpMethod: request.requestDescriptor.httpMethod,
      isRemoved: request.isRemoved
    },
    path
  }));

  return {
    apiName,
    endpoints
  };
}
