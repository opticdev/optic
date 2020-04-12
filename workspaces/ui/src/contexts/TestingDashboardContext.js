import React, {useContext, useEffect, useState} from 'react';

const TestingDashboardContext = React.createContext(null);

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = TestingDashboardContext;

// to make sure the actual shape of the context remains an implementation detail
// we're in control of here
export function createContext({ service, baseUrl }) {
  return { service, baseUrl };
}

export function useTestingService(
  performRequest, // Note: this is where a TS interface would give some nice safety
  deps
) {
  const { service } = useContext(TestingDashboardContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    performRequest(service)
      .then((result) => {
        setResult(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
      });
  }, deps);

  return { result, loading, error };
}

export function useReportPath(captureId) {
  const { baseUrl } = useContext(TestingDashboardContext);

  return `${baseUrl}/captures/${captureId}`;
}

export { queriesFromEvents } from '../services/TestingService';
