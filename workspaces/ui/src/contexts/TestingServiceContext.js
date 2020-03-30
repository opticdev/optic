import React, { useContext, useEffect, useState } from 'react';

const TestingServiceContext = React.createContext(null);

// only expose the Provider component, but hide the Consumer in favour of hooks
export const { Provider } = TestingServiceContext;

export function useTestingService(
  performRequest, // Note: this is where a TS interface would give some nice safety
  deps
) {
  const service = useContext(TestingServiceContext);
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
        setError(err);
      });
  }, deps);

  return { result, loading, error };
}
