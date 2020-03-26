import React, {useContext, useEffect, useState} from 'react';
import Loading from '../navigation/Loading';
import {Link, Switch, Route} from 'react-router-dom';
import {opticEngine} from '@useoptic/domain';

async function ExampleReportTestingDashboardServiceBuilder(exampleId) {
  const example = await fetch(`/example-reports/${exampleId}.json`, {
    headers: {
      'accept': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error();
    });

  const {
    orgId,
    specs,
    reports,
    captures
  } = example;

  class ExampleReportTestingDashboardService {
    constructor(orgId) {
      this.orgId = orgId;
    }

    async loadSpec(captureId) {
      await new Promise(r => setTimeout(r, 200));
      return specs[captureId];
    }

    async listCaptures() {
      await new Promise(r => setTimeout(r, 200));
      return captures;
    }

    async loadReport(captureId) {
      await new Promise(r => setTimeout(r, 200));
      return reports[captureId];
    }
  }

  return new ExampleReportTestingDashboardService(orgId);
}

function DefaultReportRedirect(props) {
  const { match } = props;
  const baseUrl = match.url;

  // TODO: consider factoring this as a useCaptures hook, for re-use elsewhere
  // ApolloClient's useQuery might serve as inspiration for this: https://github.com/apollographql/apollo-client/blob/master/src/react/hooks/utils/useBaseQuery.ts
  const service = useContext(TestingDashboardServiceContext);
  const [captures, setCaptures] = useState(null);
  useEffect(() => {
    const fetchCaptures = async () => {
      debugger;
      const captures = await service.listCaptures();
      setCaptures(captures);
    };

    // TODO: add error handling
    fetchCaptures();
  }, []);

  if (!captures) {
    return <Loading />;
  }

  let mostRecent = captures[0];
  if (mostRecent) {
    return <Redirect to={`${baseUrl}/captures/${mostRecent.captureId}`} />;
  } else {
    // TODO: revisit this UI state
    return <div>You don't have any captures yet</div>;
  }
}

function useDashboardService(
  performRequest // Note: this is where a TS interface would give some nice safety
) {
  const service = useContext(TestingDashboardServiceContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    performRequest(service)
      .then(result => {
        setResult(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
      });
  }, []);

  return { result, loading, error };
}

const ReadonlySpecContext = React.createContext(null);
const TestingDashboardServiceContext = React.createContext(null);

export function specFromEvents(events) {
  const {contexts} = opticEngine.com.useoptic;
  const {RfcServiceJSFacade} = contexts.rfc;
  const rfcServiceFacade = RfcServiceJSFacade();
  const eventStore = rfcServiceFacade.makeEventStore();
  const rfcId = 'testRfcId';

  const specJson = JSON.stringify(events);
  eventStore.bulkAdd(rfcId, specJson);

  const rfcService = rfcServiceFacade.makeRfcService(eventStore);
  const rfcState = rfcService.currentState(rfcId);
  return rfcState;
}

function SpecLoader(props) {
  const {children, captureId} = props;
  const service = useContext(TestingDashboardServiceContext);
  const [events, setEvents] = useState(null);
  useEffect(() => {
    const task = async () => {
      debugger
      const e = await service.loadSpec(captureId);
      debugger
      setEvents(e);
    };
    task();
  }, [captureId]);

  if (!events) {
    return <Loading/>;
  }

  const rfcState = specFromEvents(events);
  debugger
  return (
    <ReadonlySpecContext.Provider value={rfcState}>
      {children}
    </ReadonlySpecContext.Provider>
  );
}

function DashboardLoaderFactory({ serviceFactory, getBaseUrl }) {
  return function(props) {
    const { match } = props;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [service, setService] = useState(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const task = async () => {
        const s = await serviceFactory(props);
        setService(s);
      };
      task();
    }, []);

    if (!service) {
      return <Loading />;
    }

    return (
      <TestingDashboardServiceContext.Provider value={service}>
        <Switch>
          <Route
            path={`${match.url}/captures/:captureId`}
            component={TestingDashboard}
          />
          <Route component={DefaultReportRedirect} />
        </Switch>
      </TestingDashboardServiceContext.Provider>
    );
  };
}

export function TestingDashboard(props) {
  const { captureId } = props.match.params;
  const {
    loading: loadingReport,
    result: report
  } = useDashboardService(service => service.loadReport(captureId));

  return (
    <div>
      <h2>Live Contract Testing Dashboard for capture {captureId}</h2>

      {loadingReport && <Loading />}

      {report && <TestingReport report={report} />}

      <SpecLoader captureId={captureId}>
        <div>spec loaded :)</div>
      </SpecLoader>
    </div>
  );
}

export function TestingReport(props) {
  const { report } = props;

  return <div>Fetched report! {report.counts.totalInteractions}</div>;
}

export function ExampleTestingDashboardLoader() {
  return DashboardLoaderFactory({
    serviceFactory: (props) => ExampleReportTestingDashboardServiceBuilder(props.match.params.exampleId),
  });
}