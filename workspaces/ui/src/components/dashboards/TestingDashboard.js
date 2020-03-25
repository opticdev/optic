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

    loadSpec(captureId) {
      return specs[captureId];
    }

    listCaptures() {
      return captures;
    }

    loadReport(captureId) {
      return reports[captureId];
    }
  }

  return new ExampleReportTestingDashboardService(orgId);
}

function TestingDashboardHome() {
  debugger
  const routingNavigationContext = useContext(RoutingNavigationContext);
  const {baseUrl} = routingNavigationContext;
  return (
    <div>
      <Link to={`${baseUrl}/captures/capture-1`}>capture 1</Link>
    </div>
  );
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

const RoutingNavigationContext = React.createContext(null);

function DashboardLoaderFactory({serviceFactory, getBaseUrl}) {
  return function (props) {
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
      return <Loading/>;
    }

    const baseUrl = props.match.url;
    const basePath = props.match.path;

    return (
      <RoutingNavigationContext.Provider value={{baseUrl, basePath}}>
        <TestingDashboardServiceContext.Provider value={service}>
          <Switch>
            <Route path={`${basePath}/captures/:captureId`} component={TestingDashboard}/>
            <Route component={TestingDashboardHome}/>
          </Switch>
        </TestingDashboardServiceContext.Provider>
      </RoutingNavigationContext.Provider>
    );
  };
}


export function TestingDashboard(props) {
  const {captureId} = props.match.params;

  return (
    <div>
      <h2>Live Contract Testing Dashboard for capture {captureId}</h2>
      <SpecLoader captureId={captureId}>
        <div>spec loaded :)</div>
      </SpecLoader>
    </div>
  );
}

export function ExampleTestingDashboardLoader() {
  return DashboardLoaderFactory({
    serviceFactory: (props) => ExampleReportTestingDashboardServiceBuilder(props.match.params.exampleId),
  });
}