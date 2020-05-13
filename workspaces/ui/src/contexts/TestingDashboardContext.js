import React, { useContext, useEffect, useRef, useState } from 'react';
import { TestingServiceError } from '../services/TestingService';

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
  deps = []
) {
  const { service } = useContext(TestingDashboardContext);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(null);
  const isUnmounted = useRef(false);

  useEffect(() => {
    performRequest(service)
      .then((result) => {
        if (isUnmounted.current) return;
        setResult(result);

        // TODO: that we have to check here again probably means we'll want to use useReducer
        if (isUnmounted.current) return;
        setLoading(false);
      })
      .catch((err) => {
        if (isUnmounted.current) return;

        if (TestingServiceError.instanceOf(err) && err.notFound()) {
          setNotFound(true);
          setLoading(false);
        } else {
          setError(err);
        }
      });
  }, deps);

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
    };
  }, []);

  return { result, loading, error, notFound };
}

export function useReportPath(captureId) {
  const { baseUrl } = useContext(TestingDashboardContext);

  return `${baseUrl}/captures/${captureId}`;
}

export function useEndpointPath(captureId, endpointId) {
  const { baseUrl } = useContext(TestingDashboardContext);

  return `${baseUrl}/captures/${captureId}/endpoints/${endpointId}`;
}

export { queriesFromEvents } from '../services/TestingService';
