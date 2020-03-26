import React, { useContext, useEffect, useState } from "react";
import Loading from "../navigation/Loading";
import { Link, Switch, Route, Redirect } from "react-router-dom";
import { opticEngine } from "@useoptic/domain";

async function ExampleReportTestingDashboardServiceBuilder(exampleId) {
  const example = await fetch(`/example-reports/${exampleId}.json`, {
    headers: {
      accept: "application/json"
    }
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });

  const { orgId, specs, reports, captures } = example;

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

  const { loading, result: captures } = useDashboardService(service =>
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

function useDashboardService(
  performRequest, // Note: this is where a TS interface would give some nice safety
  deps
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
  }, deps);

  return { result, loading, error };
}

function useSpec(captureId) {
  const { result: events, ...hookRest } = useDashboardService(
    service => service.loadSpec(captureId),
    [captureId]
  );

  let rfcState = null;
  if (events) {
    rfcState = specFromEvents(events);
  }

  return { ...hookRest, result: rfcState };
}

const ReadonlySpecContext = React.createContext(null);
const TestingDashboardServiceContext = React.createContext(null);

export function specFromEvents(events) {
  const { contexts } = opticEngine.com.useoptic;
  const { RfcServiceJSFacade } = contexts.rfc;
  const rfcServiceFacade = RfcServiceJSFacade();
  const eventStore = rfcServiceFacade.makeEventStore();
  // TODO: figure out where this is supposed to come from
  const rfcId = "testRfcId";

  const specJson = JSON.stringify(events);
  eventStore.bulkAdd(rfcId, specJson);

  const rfcService = rfcServiceFacade.makeRfcService(eventStore);
  const rfcState = rfcService.currentState(rfcId);
  return rfcState;
}

function SpecLoader(props) {
  const { children, captureId } = props;
  const { result: rfcState, loading } = useSpec(captureId);

  if (loading) {
    return <Loading />;
  }

  if (!rfcState) {
    // TODO: revisit the branch for this state
    return <div>Could not find the spec for this report</div>;
  }
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
  } = useDashboardService(service => service.loadReport(captureId), [
    captureId
  ]);

  const { loading: loadingSpec, result: rfcState } = useSpec(captureId);

  return (
    <div>
      <h2>Live Contract Testing Dashboard for capture {captureId}</h2>

      {(loadingReport || loadingSpec) && <Loading />}

      {report && rfcState && (
        <TestingReport report={report} rfcState={rfcState} />
      )}
    </div>
  );
}

export function TestingReport(props) {
  const { report, rfcState } = props;

  console.log(rfcState);

  return <div>Fetched report! {report.counts.totalInteractions}</div>;
}

export function ExampleTestingDashboardLoader() {
  return DashboardLoaderFactory({
    serviceFactory: props =>
      ExampleReportTestingDashboardServiceBuilder(props.match.params.exampleId)
  });
}
